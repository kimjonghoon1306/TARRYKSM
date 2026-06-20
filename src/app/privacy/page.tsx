import LegalView from "@/components/LegalView";
import { platformPrivacy, PLATFORM_NAME } from "@/lib/platformLegal";

export const metadata = { title: "개인정보처리방침 — ONJONGIL" };

export default function PlatformPrivacyPage() {
  return <LegalView slug="" storeName={`${PLATFORM_NAME} 서비스`} title="개인정보처리방침" sections={platformPrivacy} backHref="/signup" />;
}
