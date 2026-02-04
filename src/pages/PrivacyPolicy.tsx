import { motion } from 'framer-motion'
import { Shield, Mail, Database, Cookie, UserCheck, Trash2, Lock } from 'lucide-react'

export function PrivacyPolicy() {
  const sections = [
    {
      icon: Database,
      title: '1. Kokie duomenys renkami',
      content: `Mes renkame šiuos asmens duomenis:

• **El. pašto adresas** – registracijai ir prisijungimui
• **Slaptažodis** – užšifruotas ir saugomas saugiai
• **Būrimų istorija** – jūsų atlikti būrimai ir užrašai
• **Kasdienės runos** – jūsų trauktos runos ir refleksijos
• **Mėgstamos runos** – jūsų pasirinktos mėgstamos runos
• **Prenumeratos informacija** – prenumeratos statusas ir galiojimo data

**Mokėjimų duomenys:**
Mokėjimus apdoroja **Stripe** – mes **nesaugome** jūsų kortelės numerio ar CVV kodo. Stripe yra PCI DSS sertifikuota platforma.`
    },
    {
      icon: UserCheck,
      title: '2. Kaip naudojame jūsų duomenis',
      content: `Jūsų duomenis naudojame šiems tikslams:

• **Paskyros valdymui** – autentifikacijai ir prieigos kontrolei
• **Paslaugų teikimui** – būrimų išsaugojimui ir istorijos rodymui
• **Personalizacijai** – jūsų patirties pritaikymui
• **Komunikacijai** – svarbių pranešimų siuntimui (tik su jūsų sutikimu)

Mes **neparduodame** ir **nesidalijame** jūsų duomenimis su trečiosiomis šalimis rinkodaros tikslais.`
    },
    {
      icon: Lock,
      title: '3. Duomenų saugumas',
      content: `Jūsų duomenų saugumui užtikrinti taikome šias priemones:

• **Šifravimas** – visi duomenys perduodami per HTTPS
• **Slaptažodžių apsauga** – slaptažodžiai saugomi naudojant bcrypt šifravimą
• **Saugi infrastruktūra** – naudojame Supabase platformą su įmonės lygio saugumu
• **Prieigos kontrolė** – Row Level Security (RLS) užtikrina, kad matote tik savo duomenis
• **Reguliarios patikros** – periodiškai peržiūrime saugumo praktikas`
    },
    {
      icon: Cookie,
      title: '4. Slapukai ir sekimas',
      content: `Mūsų svetainė naudoja minimalų kiekį slapukų:

• **Būtinieji slapukai** – autentifikacijos sesijos valdymui
• **Analitika** – Google Analytics (anoniminė) svetainės tobulinimui

Mes **nenaudojame** reklamų sekimo slapukų ar trečiųjų šalių rinkodaros įrankių.

Galite valdyti slapukus savo naršyklės nustatymuose.`
    },
    {
      icon: UserCheck,
      title: '5. Jūsų teisės (BDAR/GDPR)',
      content: `Pagal Bendrąjį duomenų apsaugos reglamentą (BDAR) turite šias teises:

• **Prieigos teisė** – gauti savo duomenų kopiją
• **Taisymo teisė** – pataisyti netikslius duomenis
• **Ištrynimo teisė** – ištrinti savo paskyrą ir duomenis
• **Apribojimo teisė** – apriboti duomenų tvarkymą
• **Prieštaravimo teisė** – nesutikti su duomenų tvarkymu
• **Perkeliamumo teisė** – gauti duomenis perkeliamuoju formatu

Norėdami pasinaudoti šiomis teisėmis, susisiekite su mumis el. paštu.`
    },
    {
      icon: Trash2,
      title: '6. Duomenų saugojimas ir ištrynimas',
      content: `Duomenų saugojimo politika:

• **Aktyvios paskyros** – duomenys saugomi kol paskyra aktyvi
• **Neaktyvios paskyros** – po 24 mėnesių neaktyvumo galime ištrinti duomenis
• **Paskyros ištrynimas** – galite bet kada ištrinti paskyrą profilio nustatymuose
• **Ištrynimo terminas** – duomenys ištrinami per 30 dienų nuo prašymo

Kai kurie duomenys gali būti saugomi ilgiau dėl teisinių prievolių.`
    },
    {
      icon: Shield,
      title: '7. Vaikų privatumas',
      content: `Mūsų paslauga skirta asmenims nuo 16 metų amžiaus.

Mes sąmoningai nerenkame informacijos iš vaikų iki 16 metų. Jei sužinosime, kad surinkome vaiko duomenis, nedelsdami juos ištrinsime.

Jei esate tėvas/motina ir manote, kad jūsų vaikas pateikė mums asmens duomenis, susisiekite su mumis.`
    }
  ]

  return (
    <div className="px-4" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div style={{ width: '100%', maxWidth: '896px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-900/50 border border-purple-500/30">
            <Shield className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-white">
            Privatumo Politika
          </h1>
          <p className="text-gray-400 text-base">
            Paskutinį kartą atnaujinta: 2026 m. vasario 3 d.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/60 backdrop-blur-sm border border-amber-600/20 rounded-2xl p-6 md:p-8 mb-8"
        >
          <p className="text-gray-300 leading-relaxed">
            „Runų Būrimas" (toliau – „mes", „mūsų" arba „Paslauga") gerbia jūsų privatumą ir įsipareigoja saugoti jūsų asmens duomenis.
            Ši privatumo politika paaiškina, kaip renkame, naudojame ir saugome jūsų informaciją, kai naudojatės mūsų svetaine ir paslaugomis.
          </p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6 md:p-8 hover:border-purple-500/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-900/50 border border-purple-500/30 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-cinzel font-semibold text-white mb-4">
                    {section.title}
                  </h2>
                  <div className="text-gray-400 leading-relaxed whitespace-pre-line prose-invert">
                    {section.content.split('**').map((part, i) =>
                      i % 2 === 1 ? <strong key={i} className="text-amber-300 font-medium">{part}</strong> : part
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-purple-900/40 to-amber-900/20 border border-purple-500/30 rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Mail className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-cinzel font-semibold text-white mb-2">
                Susisiekite su mumis
              </h2>
              <p className="text-gray-400 mb-4">
                Jei turite klausimų apie šią privatumo politiką arba norite pasinaudoti savo teisėmis, susisiekite:
              </p>
              <a
                href="mailto:privatumas@runuburimas.lt"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                <Mail className="w-4 h-4" />
                privatumas@runuburimas.lt
              </a>
            </div>
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-gray-500 text-sm mt-8"
        >
          Ši privatumo politika gali būti atnaujinama. Apie esminius pakeitimus informuosime el. paštu arba svetainėje.
        </motion.p>
      </div>
    </div>
  )
}
