import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useLocalizedPath } from "@/lib/use-localized-path";

const NotFound: React.FC = () => {
    const { t } = useI18n()
    const localizedPath = useLocalizedPath()

    return (
        <section className="flex flex-1 items-center justify-center">
            <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
                <div className="mx-auto max-w-screen-sm text-center">
                    <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-ink">404</h1>
                    <p className="mb-4 text-3xl tracking-tight font-bold text-ink md:text-4xl">{t('notFound.title')}</p>
                    <p className="mb-4 text-lg font-light text-muted">{t('notFound.description')}</p>
                    <Button variant={"link"} asChild>
                        <Link to={localizedPath('/')}>{t('notFound.back')}</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
export default NotFound;
