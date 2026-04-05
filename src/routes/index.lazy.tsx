import { createLazyFileRoute } from '@tanstack/react-router';
import TitleScreen from '../pages/TitleScreen';

export const Route = createLazyFileRoute('/')({
  component: TitleScreen,
});
