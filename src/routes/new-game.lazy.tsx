import { createLazyFileRoute } from '@tanstack/react-router';
import NewGame from '../pages/NewGame';

export const Route = createLazyFileRoute('/new-game')({
  component: NewGame,
});
