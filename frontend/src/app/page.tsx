import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the newly integrated static HTML template
  redirect('/index.html');
}
