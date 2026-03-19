import { useRoutes } from '@/routes';
import { RouterProvider as Router, createBrowserRouter } from 'react-router-dom';

export const RouterProvider = () => {
  const { routes } = useRoutes();

  const router = createBrowserRouter(routes);
  return <Router router={router} />;
};
