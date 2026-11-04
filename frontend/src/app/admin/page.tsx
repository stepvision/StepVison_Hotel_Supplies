import { redirect } from 'next/navigation';
console.log("ss");

export default function AdminPage() {
    redirect('/admin/products');
}
