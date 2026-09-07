import { requireCouple } from "@/lib/authorization";
import { CoupleForm } from "@/components/memory-form";
import { SignOut } from "@/components/sign-out";
export default async function Settings() {
  const couple = await requireCouple();
  return <><p className="eyebrow">THE DETAILS THAT MAKE US, US</p><h1>Our details.</h1>
    {couple.role === "owner" ? <CoupleForm couple={{name:couple.name,togetherSince:couple.togetherSince,timezone:couple.timezone}} /> : <p>Only the owner can change our space settings.</p>}
    <section className="private-account"><h2>Your account</h2><SignOut /></section>
  </>;
}
