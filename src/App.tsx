import { useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useGameStore, hydrateStore } from './store/gameStore';
import Layout from './components/layout/Layout';
import PageTransition from './components/layout/PageTransition';
import HomePage from './pages/HomePage';
import PlayersPage from './pages/PlayersPage';
import TeamsPage from './pages/TeamsPage';
import ModePage from './pages/ModePage';
import BracketPage from './pages/BracketPage';
import LeaguePage from './pages/LeaguePage';
import GameplayPage from './pages/GameplayPage';
import FinalPage from './pages/FinalPage';

export default function App() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  const theme = useGameStore((s) => s.theme);

  // Apply theme class to html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Hydrate store from localStorage on mount
  useEffect(() => {
    hydrateStore();
  }, []);

  const renderPhase = () => {
    switch (gamePhase) {
      case 'home':
        return <HomePage />;
      case 'registration':
        return <PlayersPage />;
      case 'teams':
      case 'team-setup':
        return <TeamsPage />;
      case 'mode':
      case 'mode-select':
        return <ModePage />;
      case 'bracket':
      case 'bracket-view':
      case 'repechage':
        return <BracketPage />;
      case 'league':
      case 'league-view':
        return <LeaguePage />;
      case 'pre-round':
      case 'playing':
      case 'round-result':
        return <GameplayPage />;
      case 'final':
        return <FinalPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <PageTransition key={gamePhase}>
          {renderPhase()}
        </PageTransition>
      </AnimatePresence>
    </Layout>
  );
}

