
import AdminContent from './AdminContent';

/**
 * SERVER COMPONENT
 * Handles segment configuration and provides the initial shell.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminPage() {
  return <AdminContent />;
}
