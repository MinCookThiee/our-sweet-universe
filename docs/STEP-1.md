# Step 1 — နားလည်ပြီး ဆက်ဆောက်ဖို့

ဒီအဆင့်က architecture နဲ့ UI foundation ပါ။ Personal data တကယ်ထည့်သုံးမယ့် V1 အပြီးမဟုတ်သေးပါဘူး။ `/demo` ထဲက content က စိတ်ကူးနဲ့ရေးထားတဲ့ sample ဖြစ်ပြီး save မလုပ်ပါဘူး။

## 1. Next.js က ဘာလုပ်ပေးလဲ

`src/app` ထဲက folder တွေက URL ဖြစ်လာတယ်။ `page.tsx` က အဲဒီ URL ရဲ့ page ဖြစ်ပြီး `layout.tsx` က child pages တွေအတွက် common layout ပါ။

`/demo/memories` → `src/app/demo/[[...section]]/page.tsx` → `Preview` component → sample memory cards လို့သွားတယ်။ `[[...section]]` က optional route segments ကိုဖမ်းတာပါ။ မသတ်မှတ်ထားတဲ့ section ဆိုရင် 404 ပြတယ်။

`"use client"` ပါတဲ့ component မှာ button click နဲ့ React state ကိုသုံးနိုင်တယ်။ Database နဲ့ secret တွေကိုတော့ client component ထဲမထည့်ဘူး။

## 2. Prisma နဲ့သိပြီးသားကို Drizzle နဲ့ချိတ်ကြည့်မယ်

Prisma ရဲ့ `schema.prisma` နေရာမှာ Drizzle က `src/lib/db/schema.ts` ကိုသုံးတယ်။

```ts
export const memories = pgTable("memories", {
  id: uuid("id").defaultRandom().primaryKey(),
  // ...remaining fields
});
```

ဒီ declaration က PostgreSQL table ပုံစံကိုသတ်မှတ်တာပါ။ ဖိုင်ရေးလိုက်ရုံနဲ့ Neon ထဲ table မဖြစ်သေးဘူး။

`schema.ts` → `drizzle-kit generate` → reviewable SQL migration → `drizzle-kit migrate` → Neon tables ဆိုပြီး သွားမယ်။

Query မှာလည်း SQL နဲ့ ပိုနီးတယ်။

```ts
db.select().from(memories).where(eq(memories.coupleId, coupleId));
```

SQL နဲ့ဆို `SELECT ... FROM memories WHERE couple_id = ...` ဆိုတဲ့သဘောပါ။ `eq` က parameterized condition ဆောက်ပေးလို့ raw string ချိတ်ပြီး SQL ရေးစရာမလိုဘူး။

## 3. Login နဲ့ permission မတူဘူး

Better Auth session က “ဘယ်သူလဲ” ကိုဖြေတယ်။ `requireCouple()` က “ဘယ် couple space ကိုဝင်ခွင့်ရှိလဲ” ကိုဖြေတယ်။

`/space` ကိုဖွင့်ရင်:

1. Server က session ကိုစစ်တယ်။ မရှိရင် login ကိုပို့တယ်။
2. Session ရဲ့ `user.id` နဲ့ membership ကိုရှာတယ်။
3. Membership မရှိရင် content မပေးဘူး။
4. Membership ကရတဲ့ `coupleId` နဲ့ query ကိုကန့်သတ်တယ်။

Browser ကပို့တဲ့ `coupleId` ကို ယုံပြီး query မလုပ်ဘူး။ နောက်တစ်ဆင့်မှာ create/update/delete တိုင်းမှာလည်း ဒီစည်းမျဉ်းသုံးမယ်။

## 4. V2 အတွက် ကြိုပြင်ထားတာ

Memory တစ်ခုရဲ့ `coupleId` က ဘယ် space ပိုင်လဲဆိုတာ၊ `createdBy` က ဘယ် account ရေးလဲဆိုတာပါ။ V2 မှာ partner membership ထည့်လိုက်ရင် existing memories ကိုအတူဖတ်နိုင်မယ်။ Invite security နဲ့ member limit ကိုတော့ V2 မှာ သီးသန့်စမ်းသပ်ဆောက်ရမယ်။

## 5. ဒီအဆင့်မှာ စမ်းကြည့်လို့ရတာ

Home နဲ့ page ၇ ခုကိုကြည့်၊ memory card ဖွင့်၊ sample love letter ဖတ်၊ jar note ထုတ်၊ anniversary calendar count ကြည့်နိုင်တယ်။ Date calculation မှာ couple timezone ကိုသုံးပြီး February 29 ကို non-leap year မှာ February 28 သတ်မှတ်ထားတယ်။

နောက်တစ်ဆင့်က Neon development branch ချိတ်ပြီး migration run၊ first account provision၊ sign-in/sign-out နဲ့ membership isolation ကိုစမ်းတာပါ။ Credentials ကို `.env.local` ထဲမှာပဲထည့်ပါ။
