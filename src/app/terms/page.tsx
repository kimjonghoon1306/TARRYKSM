import LegalView from "@/components/LegalView";
import { platformTerms, PLATFORM_NAME } from "@/lib/platformLegal";

export const metadata = { title: "이용약관 — ONJONGIL" };

export default function PlatformTermsPage() {
  return <LegalView slug="" storeName={`${PLATFORM_NAME} 서비스`} title="이용약관" sections={platformTerms} backHref="/signup" />;
}
