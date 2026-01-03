import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { authService, statsService, type User, type PlayerStats } from '@/lib/auth';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }

    setUser(currentUser);
    
    const data = await statsService.getStats();
    if (data) {
      setStats(data.stats);
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-2xl font-bold animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (!user || !stats) {
    return null;
  }

  const experienceToNextLevel = 1000;
  const experienceProgress = (stats.experience % experienceToNextLevel) / experienceToNextLevel * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Icon name="Crosshair" className="text-primary animate-pulse-glow" size={32} />
            <h1 className="text-2xl font-black glow-orange">CS2 PRO</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Icon name="Home" className="mr-2" />
              Главная
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <Icon name="LogOut" className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-6 neon-border">
              <div className="text-center mb-6">
                <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-primary">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-3xl">{user.username[0]}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-black mb-2">{user.username}</h2>
                <Badge className="text-lg px-4 py-1">
                  Уровень {stats.level}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Опыт</span>
                    <span>{stats.experience % experienceToNextLevel} / {experienceToNextLevel}</span>
                  </div>
                  <Progress value={experienceProgress} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-3xl font-black text-primary glow-orange">#{stats.rank}</div>
                    <div className="text-sm text-muted-foreground">Рейтинг</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-secondary glow-blue">{stats.playtime_hours}ч</div>
                    <div className="text-sm text-muted-foreground">Игровое время</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 mt-6 neon-border">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Icon name="Award" className="text-primary" />
                Достижения
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Icon name="Target" className="text-accent" size={24} />
                  <div className="flex-1">
                    <div className="font-bold">Снайпер</div>
                    <div className="text-xs text-muted-foreground">1000+ убийств в голову</div>
                  </div>
                  <Badge variant={stats.headshots >= 1000 ? 'default' : 'outline'}>
                    {stats.headshots >= 1000 ? '✓' : `${stats.headshots}/1000`}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="Trophy" className="text-primary" size={24} />
                  <div className="flex-1">
                    <div className="font-bold">Победитель</div>
                    <div className="text-xs text-muted-foreground">100+ побед</div>
                  </div>
                  <Badge variant={stats.matches_won >= 100 ? 'default' : 'outline'}>
                    {stats.matches_won >= 100 ? '✓' : `${stats.matches_won}/100`}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 neon-border">
              <h3 className="text-2xl font-black mb-6 glow-orange">СТАТИСТИКА</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Icon name="Crosshair" className="mx-auto mb-2 text-primary" size={32} />
                  <div className="text-3xl font-black text-primary">{stats.kills}</div>
                  <div className="text-sm text-muted-foreground">Убийств</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Icon name="Skull" className="mx-auto mb-2 text-destructive" size={32} />
                  <div className="text-3xl font-black text-destructive">{stats.deaths}</div>
                  <div className="text-sm text-muted-foreground">Смертей</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Icon name="Users" className="mx-auto mb-2 text-secondary" size={32} />
                  <div className="text-3xl font-black text-secondary">{stats.assists}</div>
                  <div className="text-sm text-muted-foreground">Ассистов</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Icon name="Target" className="mx-auto mb-2 text-accent" size={32} />
                  <div className="text-3xl font-black text-accent">{stats.headshots}</div>
                  <div className="text-sm text-muted-foreground">Хедшотов</div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center neon-border hover:scale-105 transition-transform">
                <div className="text-5xl font-black mb-2 glow-orange">{stats.kd_ratio}</div>
                <div className="text-muted-foreground">K/D Соотношение</div>
              </Card>
              <Card className="p-6 text-center neon-border hover:scale-105 transition-transform">
                <div className="text-5xl font-black mb-2 glow-blue">{stats.win_rate}%</div>
                <div className="text-muted-foreground">Процент побед</div>
              </Card>
              <Card className="p-6 text-center neon-border hover:scale-105 transition-transform">
                <div className="text-5xl font-black mb-2 glow-purple">{stats.headshot_rate}%</div>
                <div className="text-muted-foreground">Точность хедшотов</div>
              </Card>
            </div>

            <Card className="p-6 neon-border">
              <h3 className="text-2xl font-black mb-6 glow-orange">МАТЧИ</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-4xl font-black mb-2">{stats.matches_played}</div>
                  <div className="text-muted-foreground">Всего сыграно</div>
                  <Progress value={100} className="mt-2 h-2" />
                </div>
                <div>
                  <div className="text-4xl font-black mb-2 text-primary">{stats.matches_won}</div>
                  <div className="text-muted-foreground">Побед</div>
                  <Progress value={stats.win_rate} className="mt-2 h-2" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
