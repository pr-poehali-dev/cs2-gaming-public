import json
import os
import urllib.parse
import urllib.request
import secrets
from datetime import datetime, timedelta
import psycopg2

def handler(event: dict, context) -> dict:
    """Steam OAuth авторизация и управление сессиями"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    query_params = event.get('queryStringParameters', {})
    if query_params is None:
        query_params = {}
    
    action = query_params.get('action', '').strip()
    
    if action == 'verify':
        return handle_verify(event)
    elif action == 'logout':
        return handle_logout(event)
    elif action == 'callback':
        return handle_callback(query_params)
    else:
        return handle_login(query_params)
    
    return {
        'statusCode': 404,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Not found'}),
        'isBase64Encoded': False
    }

def handle_login(query_params: dict) -> dict:
    return_url = query_params.get('return_url', 'https://your-site.com')
    
    steam_openid_url = 'https://steamcommunity.com/openid/login'
    params = {
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.return_to': f"{return_url}?auth_callback=true",
        'openid.realm': return_url.split('?')[0],
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
    }
    
    redirect_url = f"{steam_openid_url}?{urllib.parse.urlencode(params)}"
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'redirect_url': redirect_url}),
        'isBase64Encoded': False
    }

def handle_callback(query_params: dict) -> dict:
    if not validate_steam_response(query_params):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid Steam response'}),
            'isBase64Encoded': False
        }
    
    claimed_id = query_params.get('openid.claimed_id', '')
    steam_id = claimed_id.split('/')[-1]
    
    if not steam_id.isdigit():
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid Steam ID'}),
            'isBase64Encoded': False
        }
    
    steam_api_key = os.environ.get('STEAM_API_KEY')
    user_info = get_steam_user_info(steam_id, steam_api_key)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "SELECT id FROM users WHERE steam_id = %s",
        (steam_id,)
    )
    user_row = cur.fetchone()
    
    if user_row:
        user_id = user_row[0]
        cur.execute(
            "UPDATE users SET username = %s, avatar_url = %s, profile_url = %s, last_login = NOW() WHERE id = %s",
            (user_info['username'], user_info['avatar_url'], user_info['profile_url'], user_id)
        )
    else:
        cur.execute(
            "INSERT INTO users (steam_id, username, avatar_url, profile_url) VALUES (%s, %s, %s, %s) RETURNING id",
            (steam_id, user_info['username'], user_info['avatar_url'], user_info['profile_url'])
        )
        user_id = cur.fetchone()[0]
        
        cur.execute(
            "INSERT INTO player_stats (user_id) VALUES (%s)",
            (user_id,)
        )
    
    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=30)
    
    cur.execute(
        "INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (%s, %s, %s)",
        (user_id, session_token, expires_at)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'session_token': session_token,
            'user': {
                'id': user_id,
                'steam_id': steam_id,
                'username': user_info['username'],
                'avatar_url': user_info['avatar_url']
            }
        }),
        'isBase64Encoded': False
    }

def handle_verify(event: dict) -> dict:
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No token provided'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        """SELECT us.user_id, u.steam_id, u.username, u.avatar_url, us.expires_at 
           FROM user_sessions us 
           JOIN users u ON us.user_id = u.id 
           WHERE us.session_token = %s""",
        (token,)
    )
    session_row = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not session_row:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }
    
    user_id, steam_id, username, avatar_url, expires_at = session_row
    
    if datetime.now() > expires_at:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Token expired'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'valid': True,
            'user': {
                'id': user_id,
                'steam_id': steam_id,
                'username': username,
                'avatar_url': avatar_url
            }
        }),
        'isBase64Encoded': False
    }

def handle_logout(event: dict) -> dict:
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '')
    
    if token:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE user_sessions SET expires_at = NOW() WHERE session_token = %s", (token,))
        conn.commit()
        cur.close()
        conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def validate_steam_response(params: dict) -> bool:
    validation_params = dict(params)
    validation_params['openid.mode'] = 'check_authentication'
    
    data = urllib.parse.urlencode(validation_params).encode()
    req = urllib.request.Request('https://steamcommunity.com/openid/login', data=data)
    
    try:
        response = urllib.request.urlopen(req, timeout=10)
        result = response.read().decode()
        return 'is_valid:true' in result
    except:
        return False

def get_steam_user_info(steam_id: str, api_key: str) -> dict:
    url = f"http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={api_key}&steamids={steam_id}"
    
    try:
        req = urllib.request.Request(url)
        response = urllib.request.urlopen(req, timeout=10)
        data = json.loads(response.read().decode())
        
        player = data['response']['players'][0]
        return {
            'username': player.get('personaname', 'Unknown'),
            'avatar_url': player.get('avatarfull', ''),
            'profile_url': player.get('profileurl', '')
        }
    except:
        return {
            'username': f'Player_{steam_id[:8]}',
            'avatar_url': '',
            'profile_url': ''
        }

def get_db_connection():
    database_url = os.environ['DATABASE_URL']
    return psycopg2.connect(database_url)