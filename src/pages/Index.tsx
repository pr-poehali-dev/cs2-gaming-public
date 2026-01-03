import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { authService, type User } from '@/lib/auth';

const Index = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [chatMessage, setChatMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'ProGamer', message: 'Кто в dm?', time: '12:34' },
    { id: 2, user: 'SnipeKing', message: 'Я, го 1х1', time: '12:35' },
    { id: 3, user: 'CS2Legend', message: 'Сервер Mirage онлайн!', time: '12:36' },
  ]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('auth_callback') === 'true') {
      const user = await authService.handleCallback(params);
      if (user) {
        setCurrentUser(user);
        window.history.replaceState({}, '', '/');
        navigate('/profile');
      }
    } else {
      const user = await authService.verify();
      if (user) {
        setCurrentUser(user);
      }
    }
  };

  const handleSteamLogin = async () => {
    await authService.login();
  };

  const servers = [
    { id: 1, name: 'DUST 2 - ONLY', map: 'de_dust2', online: 24, slots: 32, ping: 12 },
    { id: 2, name: 'MIRAGE 24/7', map: 'de_mirage', online: 28, slots: 32, ping: 8 },
    { id: 3, name: 'INFERNO MIX', map: 'de_inferno', online: 18, slots: 32, ping: 15 },
    { id: 4, name: 'NUKE ONLY', map: 'de_nuke', online: 22, slots: 32, ping: 10 },
  ];

  const donatePacks = [
    { id: 1, name: 'VIP', price: 299, features: ['Приоритет входа', 'VIP чат', 'Особые модели'], color: 'from-blue-500 to-cyan-500' },
    { id: 2, name: 'PREMIUM', price: 599, features: ['Все VIP', 'Эксклюзив оружия', 'Анимации победы'], color: 'from-purple-500 to-pink-500', popular: true },
    { id: 3, name: 'LEGEND', price: 1299, features: ['Все PREMIUM', 'Уникальные скины', 'Закрытые серверы'], color: 'from-orange-500 to-red-500' },
  ];

  const topPlayers = [
    { rank: 1, name: 'DragoN', kills: 15847, deaths: 8234, kd: 1.92, lvl: 89 },
    { rank: 2, name: 'SnipeGod', kills: 14523, deaths: 7891, kd: 1.84, lvl: 85 },
    { rank: 3, name: 'ProShot', kills: 13456, deaths: 7654, kd: 1.76, lvl: 82 },
    { rank: 4, name: 'AceKing', kills: 12789, deaths: 7432, kd: 1.72, lvl: 78 },
    { rank: 5, name: 'FlashMaster', kills: 11934, deaths: 7123, kd: 1.68, lvl: 75 },
  ];

  const news = [
    { id: 1, title: 'Новый сезон турниров!', date: '15.01.2026', text: 'Стартует грандиозный сезон с призовым фондом 500.000₽' },
    { id: 2, title: 'Обновление серверов', date: '12.01.2026', text: 'Добавлены новые карты и улучшена производительность' },
    { id: 3, title: 'Итоги декабря', date: '01.01.2026', text: 'Поздравляем победителей прошлого месяца!' },
  ];

  const tournaments = [
    { id: 1, name: 'Winter Cup 2026', date: '20.01.2026', prize: '100.000₽', teams: 16, status: 'Регистрация' },
    { id: 2, name: 'Pro League S3', date: '01.02.2026', prize: '250.000₽', teams: 32, status: 'Скоро' },
    { id: 3, name: 'Cyber Battle', date: '15.02.2026', prize: '150.000₽', teams: 24, status: 'Скоро' },
  ];

  const matches = [
    { id: 1, team1: 'Dragons', team2: 'Legends', score1: 16, score2: 14, map: 'de_dust2', status: 'Завершен', time: '14:30' },
    { id: 2, team1: 'ProTeam', team2: 'Winners', score1: 12, score2: 8, map: 'de_mirage', status: 'Идёт', time: 'Live' },
    { id: 3, team1: 'Aces', team2: 'Kings', score1: 0, score2: 0, map: 'de_inferno', status: 'Скоро', time: '18:00' },
  ];

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        user: 'Ты',
        message: chatMessage,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      }]);
      setChatMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Crosshair" className="text-primary animate-pulse-glow" size={32} />
            <h1 className="text-2xl font-black glow-orange">CS2 PRO</h1>
          </div>
          <div className="flex gap-2">
            {['home', 'servers', 'donate', 'rating', 'news', 'tournaments', 'matches'].map((section) => (
              <Button
                key={section}
                variant={activeSection === section ? 'default' : 'ghost'}
                onClick={() => setActiveSection(section)}
                className="hover:scale-105 transition-transform"
              >
                {section === 'home' && 'Главная'}
                {section === 'servers' && 'Серверы'}
                {section === 'donate' && 'Донат'}
                {section === 'rating' && 'Рейтинг'}
                {section === 'news' && 'Новости'}
                {section === 'tournaments' && 'Турниры'}
                {section === 'matches' && 'Матчи'}
              </Button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {activeSection === 'home' && (
              <div className="space-y-6 animate-slide-up">
                <div className="relative h-96 rounded-xl overflow-hidden neon-border">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20" />
                  <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
                    <h2 className="text-6xl font-black mb-4 glow-orange">ДОБРО ПОЖАЛОВАТЬ</h2>
                    <p className="text-2xl text-muted-foreground mb-8">Лучшие CS2 серверы России</p>
                    <div className="flex gap-4">
                      <Button size="lg" className="text-lg px-8 hover:scale-110 transition-transform">
                        <Icon name="Play" className="mr-2" />
                        Начать играть
                      </Button>
                      <Button size="lg" variant="outline" className="text-lg px-8 hover:scale-110 transition-transform">
                        <Icon name="Users" className="mr-2" />
                        Сообщество
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-6 text-center hover:scale-105 transition-transform cursor-pointer neon-border">
                    <Icon name="Users" className="mx-auto mb-2 text-primary" size={40} />
                    <div className="text-3xl font-bold glow-orange">2,847</div>
                    <div className="text-muted-foreground">Игроков онлайн</div>
                  </Card>
                  <Card className="p-6 text-center hover:scale-105 transition-transform cursor-pointer neon-border">
                    <Icon name="Server" className="mx-auto mb-2 text-secondary" size={40} />
                    <div className="text-3xl font-bold glow-blue">12</div>
                    <div className="text-muted-foreground">Активных серверов</div>
                  </Card>
                  <Card className="p-6 text-center hover:scale-105 transition-transform cursor-pointer neon-border">
                    <Icon name="Trophy" className="mx-auto mb-2 text-accent" size={40} />
                    <div className="text-3xl font-bold glow-purple">500K</div>
                    <div className="text-muted-foreground">Призовой фонд</div>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === 'servers' && (
              <div className="space-y-4 animate-slide-up">
                <h2 className="text-4xl font-black glow-orange mb-6">СЕРВЕРЫ</h2>
                {servers.map((server) => (
                  <Card key={server.id} className="p-6 hover:scale-[1.02] transition-transform neon-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Icon name="Server" className="text-primary" size={40} />
                        <div>
                          <h3 className="text-xl font-bold">{server.name}</h3>
                          <p className="text-muted-foreground">{server.map}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{server.online}/{server.slots}</div>
                          <div className="text-xs text-muted-foreground">Игроков</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-secondary">{server.ping}ms</div>
                          <div className="text-xs text-muted-foreground">Пинг</div>
                        </div>
                        <Button className="hover:scale-110 transition-transform">
                          <Icon name="Play" className="mr-2" size={20} />
                          Играть
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeSection === 'donate' && (
              <div className="space-y-6 animate-slide-up">
                <h2 className="text-4xl font-black glow-orange mb-6">ДОНАТ</h2>
                <div className="grid grid-cols-3 gap-6">
                  {donatePacks.map((pack) => (
                    <Card key={pack.id} className={`p-6 relative overflow-hidden hover:scale-105 transition-transform ${pack.popular ? 'ring-2 ring-primary' : ''}`}>
                      {pack.popular && (
                        <Badge className="absolute top-4 right-4 bg-primary">Популярное</Badge>
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-br ${pack.color} opacity-10`} />
                      <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-2">{pack.name}</h3>
                        <div className="text-4xl font-black mb-4 glow-orange">{pack.price}₽</div>
                        <ul className="space-y-2 mb-6">
                          {pack.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Icon name="Check" className="text-primary" size={20} />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full hover:scale-105 transition-transform">Купить</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'rating' && (
              <div className="space-y-4 animate-slide-up">
                <h2 className="text-4xl font-black glow-orange mb-6">РЕЙТИНГ ИГРОКОВ</h2>
                {topPlayers.map((player) => (
                  <Card key={player.rank} className="p-6 hover:scale-[1.02] transition-transform neon-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`text-3xl font-black ${player.rank === 1 ? 'text-primary glow-orange' : player.rank === 2 ? 'text-secondary glow-blue' : player.rank === 3 ? 'text-accent glow-purple' : 'text-muted-foreground'}`}>
                          #{player.rank}
                        </div>
                        <Avatar className="h-12 w-12 border-2 border-primary">
                          <AvatarFallback>{player.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-bold">{player.name}</h3>
                          <p className="text-muted-foreground">Уровень {player.lvl}</p>
                        </div>
                      </div>
                      <div className="flex gap-8 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">{player.kills}</div>
                          <div className="text-xs text-muted-foreground">Убийств</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-destructive">{player.deaths}</div>
                          <div className="text-xs text-muted-foreground">Смертей</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-secondary">{player.kd}</div>
                          <div className="text-xs text-muted-foreground">K/D</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeSection === 'news' && (
              <div className="space-y-4 animate-slide-up">
                <h2 className="text-4xl font-black glow-orange mb-6">НОВОСТИ</h2>
                {news.map((item) => (
                  <Card key={item.id} className="p-6 hover:scale-[1.02] transition-transform neon-border">
                    <div className="flex items-start gap-4">
                      <Icon name="Newspaper" className="text-primary" size={40} />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                        <p className="text-muted-foreground mb-2">{item.text}</p>
                        <Badge variant="outline">{item.date}</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeSection === 'tournaments' && (
              <div className="space-y-4 animate-slide-up">
                <h2 className="text-4xl font-black glow-orange mb-6">ТУРНИРЫ</h2>
                {tournaments.map((tournament) => (
                  <Card key={tournament.id} className="p-6 hover:scale-[1.02] transition-transform neon-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Icon name="Trophy" className="text-accent animate-pulse-glow" size={48} />
                        <div>
                          <h3 className="text-2xl font-bold">{tournament.name}</h3>
                          <p className="text-muted-foreground">{tournament.teams} команд · {tournament.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black glow-orange mb-2">{tournament.prize}</div>
                        <Badge className={tournament.status === 'Регистрация' ? 'bg-primary' : 'bg-secondary'}>
                          {tournament.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeSection === 'matches' && (
              <div className="space-y-4 animate-slide-up">
                <h2 className="text-4xl font-black glow-orange mb-6">МАТЧИ</h2>
                {matches.map((match) => (
                  <Card key={match.id} className="p-6 hover:scale-[1.02] transition-transform neon-border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-right">
                        <div className="text-2xl font-bold">{match.team1}</div>
                      </div>
                      <div className="px-8 text-center">
                        <div className="text-4xl font-black">
                          <span className="glow-orange">{match.score1}</span>
                          <span className="text-muted-foreground mx-2">:</span>
                          <span className="glow-blue">{match.score2}</span>
                        </div>
                        <Badge variant={match.status === 'Идёт' ? 'default' : 'outline'} className="mt-2">
                          {match.status === 'Идёт' ? (
                            <><Icon name="Circle" className="mr-1 animate-pulse" size={12} />{match.time}</>
                          ) : match.time}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{match.map}</p>
                      </div>
                      <div className="flex-1">
                        <div className="text-2xl font-bold">{match.team2}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-4 neon-border">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Icon name="MessageCircle" className="text-primary" />
                Чат
              </h3>
              <ScrollArea className="h-96 mb-4">
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <span className="font-bold text-primary">{msg.user}</span>
                      <span className="text-muted-foreground text-xs ml-2">{msg.time}</span>
                      <p className="text-foreground">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  placeholder="Сообщение..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            </Card>

            <Card className="p-4 neon-border">
              <h3 className="font-bold mb-4">Быстрый вход</h3>
              {currentUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary">
                      <AvatarImage src={currentUser.avatar_url} />
                      <AvatarFallback>{currentUser.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-bold">{currentUser.username}</div>
                      <div className="text-xs text-muted-foreground">Игрок</div>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => navigate('/profile')}>
                    <Icon name="User" className="mr-2" />
                    Профиль
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button className="w-full" variant="outline" onClick={handleSteamLogin}>
                    <Icon name="LogIn" className="mr-2" />
                    Войти через Steam
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;