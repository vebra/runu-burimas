import { motion } from 'framer-motion'
import { ScrollText, AlertTriangle, UserCheck, Ban, Scale, RefreshCw, Mail, Shield, Crown, CreditCard } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'

export function TermsOfService() {
  usePageTitle('Naudojimo Sąlygos')
  const sections = [
    {
      icon: UserCheck,
      title: '1. Paslaugos aprašymas',
      content: `„Runų Būrimas" yra internetinė platforma, skirta:

**Nemokamos funkcijos:**
• **Kasdienė Runa** – viena runa kiekvienai dienai
• **Trys Runos** – praeitis, dabartis, ateitis
• **Taip/Ne būrimas** – greitas atsakymas į klausimą
• **Runų Biblioteka** – informacija apie Elder Futhark runas
• **Runų Konverteris** – teksto konvertavimas į runas

**Premium funkcijos (mokama prenumerata):**
• **5 Runų Kryžius** – situacijos analizė
• **7 Runų Gyvenimo Žemėlapis** – gilus dvasinis kelias
• **Meilės Būrimas** – 5 runų santykių analizė
• **Keltų Kryžius** – išsamus 10 runų būrimas
• **AI interpretacijos** – išsamios būrimų analizės

Paslauga teikiama **pramogos ir savirefleksijos** tikslais. Runų būrimai nėra ir neturėtų būti laikomi profesionalia konsultacija.`
    },
    {
      icon: AlertTriangle,
      title: '2. Atsakomybės ribojimas',
      content: `**Svarbu suprasti:**

• Runų būrimai yra **simbolinė praktika**, ne mokslinė ar medicininė konsultacija
• Mes **negarantuojame** jokių konkretų rezultatų ar prognozių tikslumo
• Būrimų interpretacijos yra **bendro pobūdžio** ir skirtos savirefleksijai
• **Neprisiimame atsakomybės** už sprendimus, priimtus remiantis būrimais

Jei turite rimtų gyvenimo, sveikatos ar finansinių klausimų, kreipkitės į atitinkamus specialistus.`
    },
    {
      icon: UserCheck,
      title: '3. Vartotojo įsipareigojimai',
      content: `Naudodamiesi mūsų paslauga, jūs sutinkate:

• Pateikti **teisingą informaciją** registracijos metu
• **Saugoti savo prisijungimo duomenis** ir nesidalinti jais su kitais
• Naudoti paslaugą tik **teisėtais tikslais**
• **Nepiktnaudžiauti** paslauga (pvz., automatizuoti užklausas, bandyti įsilaužti)
• Gerbti **kitų vartotojų** privatumą ir teises
• Būti **ne jaunesniems nei 16 metų** amžiaus`
    },
    {
      icon: Shield,
      title: '4. Būrimo taisyklės ir etika',
      content: `**Asmeninio būrimo principas:**

Būrimas runomis gali būti atliekamas tik **registruoto asmens ir tik jam pačiam**. Registruotas naudotojas turi teisę kreiptis į runas **išskirtinai dėl savo asmeninių klausimų** ir savo gyvenimo situacijų.

**Draudžiama:**
• Būrti **kitiems asmenims** – interpretuoti runų žinutes trečiųjų asmenų vardu
• Naudoti būrimą **kito asmens gyvenimo** atžvilgiu
• Bandyti gauti informaciją apie **kitų žmonių** situacijas ar likimą

**Kodėl tai svarbu:**
Runų tradicija grindžiama **asmenine atsakomybe**, sąmoningu dalyvavimu ir individualiu ryšiu, kuris negali būti perduodamas ar naudojamas kito asmens reikmėms.

Ši taisyklė užtikrina būrimo **aiškumą, etiką ir pagarbą** senajai runų išminčiai, išlaikant ją autentišką ir prasmingą kiekvienam, kuris renkasi šią patirtį.`
    },
    {
      icon: Ban,
      title: '5. Draudžiama veikla',
      content: `Naudojantis paslauga draudžiama:

• **Įsilaužimo bandymai** – bandyti gauti neautorizuotą prieigą
• **Kenkėjiška programinė įranga** – įkelti virusus ar kenkėjišką kodą
• **Spam ir reklama** – siųsti nepageidaujamą turinį
• **Apsimetinėjimas** – apsimesti kitu asmeniu ar organizacija
• **Intelektinės nuosavybės pažeidimai** – kopijuoti ar platinti mūsų turinį be leidimo
• **Paslaugos sutrikdymas** – tyčia perkrauti ar sutrikdyti paslaugos veikimą

Pažeidus šias taisykles, paskyra gali būti **sustabdyta arba ištrinta**.`
    },
    {
      icon: Shield,
      title: '6. Intelektinė nuosavybė',
      content: `Visos teisės į paslaugą priklauso mums:

• **Svetainės dizainas** – vizualiniai elementai, išdėstymas
• **Programinis kodas** – aplikacijos funkcionalumas
• **Turinys** – runų aprašymai, interpretacijos, tekstai
• **Prekės ženklas** – „Runų Būrimas" pavadinimas ir logotipas

Jūs **galite**:
• Naudoti paslaugą asmeniniais tikslais
• Dalintis savo būrimų rezultatais socialiniuose tinkluose

Jūs **negalite**:
• Kopijuoti ar perpardavinėti mūsų turinio
• Kurti išvestinių produktų be raštiško leidimo`
    },
    {
      icon: Crown,
      title: '7. Premium prenumerata',
      content: `**Prenumeratos planai:**
• **Mėnesinis** – €9.99/mėn, atnaujinamas automatiškai
• **Metinis** – €79.99/metai (sutaupote ~33%)

**Mokėjimas:**
• Mokėjimai apdorojami per **Stripe** – saugų mokėjimų tinklą
• Priimamos **Visa, Mastercard, American Express** kortelės
• Mokėjimas nuskaičiuojamas **iš karto** po prenumeratos aktyvavimo

**Atšaukimas:**
• Galite atšaukti prenumeratą **bet kuriuo metu**
• Po atšaukimo Premium prieiga išliks iki **mokėjimo periodo pabaigos**
• Pinigai už nepanaudotą laikotarpį **negrąžinami**

**Automatinis atnaujinimas:**
• Prenumerata atnaujinama automatiškai kiekvieno periodo pabaigoje
• Prieš atnaujinimą **negausite** papildomo pranešimo
• Norėdami sustabdyti, atšaukite prenumeratą prieš periodo pabaigą`
    },
    {
      icon: CreditCard,
      title: '8. Mokėjimai ir grąžinimai',
      content: `**Mokėjimų saugumas:**
• Visi mokėjimai apdorojami per **Stripe** – PCI DSS sertifikuotą platformą
• Mes **nesaugome** jūsų kortelės duomenų savo serveriuose
• Mokėjimai yra **šifruojami** SSL/TLS protokolu

**Grąžinimo politika:**
• Prenumeratos mokesčiai **negrąžinami** po aktyvavimo
• Išimtis: techninės klaidos ar neteisėti nuskaitymai
• Dėl grąžinimų kreipkitės: **info@runuburimas.lt**

**Kainų pakeitimai:**
• Apie kainų pakeitimus informuosime **30 dienų** iš anksto
• Esami prenumeratoriai išlaikys seną kainą iki periodo pabaigos`
    },
    {
      icon: RefreshCw,
      title: '9. Paslaugos pakeitimai',
      content: `Mes pasiliekame teisę:

• **Keisti funkcijas** – pridėti, modifikuoti ar pašalinti funkcijas
• **Atnaujinti kainas** – pranešus iš anksto
• **Sustabdyti paslaugą** – laikinai ar visam laikui, pranešus iš anksto
• **Keisti šias sąlygas** – apie esminius pakeitimus informuosime el. paštu

Tęsdami naudojimąsi paslauga po pakeitimų, sutinkate su naujomis sąlygomis.`
    },
    {
      icon: Scale,
      title: '10. Ginčų sprendimas',
      content: `Ginčų sprendimo tvarka:

• **Taikomas teisė** – Lietuvos Respublikos teisė
• **Derybos** – pirmiausia bandysime išspręsti ginčą draugiškai
• **Teismingumas** – ginčai sprendžiami Lietuvos Respublikos teismuose
• **Vartotojų teisės** – šios sąlygos neriboja jūsų teisių pagal vartotojų apsaugos įstatymus

Jei nesutinkate su mūsų sprendimu, galite kreiptis į Valstybinę vartotojų teisių apsaugos tarnybą.`
    },
    {
      icon: ScrollText,
      title: '11. Baigiamosios nuostatos',
      content: `Papildoma informacija:

• **Sąlygų galiojimas** – šios sąlygos galioja nuo pirmo paslaugos naudojimo
• **Atskiriamumas** – jei kuri nors nuostata pripažįstama negaliojančia, kitos lieka galioti
• **Visa sutartis** – šios sąlygos kartu su privatumo politika sudaro visą susitarimą
• **Teisių nepraradimas** – mūsų neveikimas nereiškia teisių atsisakymo

Dėkojame, kad naudojatės „Runų Būrimas" ir tikimės, kad runos suteiks jums įkvėpimo bei aiškumo.`
    }
  ]

  return (
    <div className="px-4 pt-20 md:pt-32 pb-24" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '896px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-900/50 border border-amber-500/30">
            <ScrollText className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-white">
            Naudojimo Sąlygos
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
            Sveiki atvykę į „Runų Būrimas"! Prieš naudodamiesi mūsų paslaugomis, prašome atidžiai perskaityti šias naudojimo sąlygas.
            Naudodamiesi svetaine ir paslaugomis, jūs sutinkate su šiomis sąlygomis.
          </p>
        </motion.div>

        {/* Warning box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
            <div className="min-w-0 w-full">
              <h3 className="text-amber-300 font-semibold mb-2">Svarbus įspėjimas</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Runų būrimai yra senovinė simbolinė praktika, skirta savirefleksijai ir pramogai.
                Jie <strong className="text-amber-300">nėra</strong> mokslinė, medicininė, psichologinė ar finansinė konsultacija.
                Priimdami svarbius gyvenimo sprendimus, visada konsultuokitės su kvalifikuotais specialistais.
              </p>
            </div>
          </div>
        </motion.div>

        <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-gray-900/60 border border-amber-600/20 rounded-xl p-6 md:p-8"
            >
              <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-900/50 border border-amber-500/30 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0 w-full">
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
          className="mt-16 bg-linear-to-r from-amber-900/40 to-purple-900/20 border border-amber-500/30 rounded-2xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Mail className="w-6 h-6 text-purple-400" />
            </div>
            <div className="min-w-0 w-full">
              <h2 className="text-xl font-cinzel font-semibold text-white mb-2">
                Turite klausimų?
              </h2>
              <p className="text-gray-400 mb-4">
                Jei turite klausimų apie šias naudojimo sąlygas ar paslaugą, susisiekite su mumis:
              </p>
              <a
                href="mailto:info@runuburimas.lt"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                <Mail className="w-4 h-4" />
                info@runuburimas.lt
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
          style={{ marginBottom: '120px' }}
        >
          Naudodamiesi „Runų Būrimas" paslaugomis, jūs patvirtinate, kad perskaitėte ir sutinkate su šiomis sąlygomis.
        </motion.p>
      </div>
    </div>
  )
}
