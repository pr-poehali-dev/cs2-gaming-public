import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Получение и обновление статистики игрока"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': ''
        }
    
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    user_id = verify_session(token)
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid session'})
        }
    
    if method == 'GET':
        return get_player_stats(user_id)
    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        return update_player_stats(user_id, body)
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }

def verify_session(token: str) -> int:
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "SELECT user_id FROM user_sessions WHERE session_token = %s AND expires_at > NOW()",
        (token,)
    )
    result = cur.fetchone()
    
    cur.close()
    conn.close()
    
    return result[0] if result else None

def get_player_stats(user_id: int) -> dict:
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        """SELECT u.username, u.avatar_url, u.steam_id,
                  ps.kills, ps.deaths, ps.assists, ps.headshots,
                  ps.matches_played, ps.matches_won, ps.playtime_hours,
                  ps.level, ps.experience, ps.rank_position
           FROM users u
           LEFT JOIN player_stats ps ON u.id = ps.user_id
           WHERE u.id = %s""",
        (user_id,)
    )
    
    row = cur.fetchone()
    
    if not row:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User not found'})
        }
    
    username, avatar_url, steam_id, kills, deaths, assists, headshots, matches_played, matches_won, playtime_hours, level, experience, rank_position = row
    
    kd_ratio = round(kills / deaths, 2) if deaths > 0 else kills
    win_rate = round((matches_won / matches_played) * 100, 1) if matches_played > 0 else 0
    headshot_rate = round((headshots / kills) * 100, 1) if kills > 0 else 0
    
    cur.execute(
        "SELECT COUNT(*) + 1 FROM player_stats WHERE kills > %s",
        (kills,)
    )
    actual_rank = cur.fetchone()[0]
    
    cur.execute("UPDATE player_stats SET rank_position = %s WHERE user_id = %s", (actual_rank, user_id))
    conn.commit()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'user': {
                'username': username,
                'avatar_url': avatar_url,
                'steam_id': steam_id
            },
            'stats': {
                'kills': kills or 0,
                'deaths': deaths or 0,
                'assists': assists or 0,
                'headshots': headshots or 0,
                'kd_ratio': kd_ratio,
                'matches_played': matches_played or 0,
                'matches_won': matches_won or 0,
                'win_rate': win_rate,
                'headshot_rate': headshot_rate,
                'playtime_hours': playtime_hours or 0,
                'level': level or 1,
                'experience': experience or 0,
                'rank': actual_rank
            }
        })
    }

def update_player_stats(user_id: int, data: dict) -> dict:
    conn = get_db_connection()
    cur = conn.cursor()
    
    fields = []
    values = []
    
    allowed_fields = ['kills', 'deaths', 'assists', 'headshots', 'matches_played', 'matches_won', 'playtime_hours', 'level', 'experience']
    
    for field in allowed_fields:
        if field in data:
            fields.append(f"{field} = %s")
            values.append(data[field])
    
    if not fields:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No valid fields to update'})
        }
    
    values.append(user_id)
    query = f"UPDATE player_stats SET {', '.join(fields)}, updated_at = NOW() WHERE user_id = %s"
    
    cur.execute(query, values)
    conn.commit()
    
    cur.close()
    conn.close()
    
    return get_player_stats(user_id)

def get_db_connection():
    database_url = os.environ['DATABASE_URL']
    return psycopg2.connect(database_url)
