import { redirect } from 'next/navigation';

export default function EducationRedirectPage() {
  // Seluruh konten informasi telah dipindahkan ke Pusat Layanan & Informasi (/support)
  redirect('/support');
}
