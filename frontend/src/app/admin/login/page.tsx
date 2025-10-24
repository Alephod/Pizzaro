import style from './page.module.scss';

import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import Image from 'next/image';

export default function AdminAuthPage() {
    return (
        <main className={'container ' + style.main}>
            <Image className={style.logo} alt="Pizzaro admin" src="/logo-admin.svg" width={150} height={60} />
            <form className={style.form}>
                <Input placeholder="Ваш логин" />
                <Input placeholder="Ваш пароль" />
                <Button type="submit" size="lg" variant="primary">
                    Войти
                </Button>
            </form>
        </main>
    );
}
