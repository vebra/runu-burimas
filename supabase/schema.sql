-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- RUNOS LENTELĖ
-- ================================
CREATE TABLE runes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  sound VARCHAR(10) NOT NULL,
  meaning TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  interpretation TEXT NOT NULL,
  reversed_interpretation TEXT,
  element VARCHAR(20),
  aett VARCHAR(20),
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- KASDIENĖS RUNOS
-- ================================
CREATE TABLE daily_runes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rune_id UUID REFERENCES runes(id),
  date DATE NOT NULL,
  orientation VARCHAR(20) DEFAULT 'upright',
  reflection TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ================================
-- BŪRIMAI
-- ================================
CREATE TABLE divinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  divination_type VARCHAR(50) NOT NULL,
  runes JSONB NOT NULL,
  question TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- MĖGSTAMOS RUNOS
-- ================================
CREATE TABLE user_favorite_runes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rune_id UUID REFERENCES runes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, rune_id)
);

-- ================================
-- ROW LEVEL SECURITY
-- ================================
ALTER TABLE daily_runes ENABLE ROW LEVEL SECURITY;
ALTER TABLE divinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_runes ENABLE ROW LEVEL SECURITY;

-- Daily Runes Policies
CREATE POLICY "Users view own daily runes"
  ON daily_runes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own daily runes"
  ON daily_runes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own daily runes"
  ON daily_runes FOR UPDATE
  USING (auth.uid() = user_id);

-- Divinations Policies
CREATE POLICY "Users view own divinations"
  ON divinations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own divinations"
  ON divinations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Favorites Policies
CREATE POLICY "Users view own favorites"
  ON user_favorite_runes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own favorites"
  ON user_favorite_runes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own favorites"
  ON user_favorite_runes FOR DELETE
  USING (auth.uid() = user_id);

-- Public Read for Runes
CREATE POLICY "Anyone can read runes"
  ON runes FOR SELECT
  USING (true);

-- ================================
-- ĮKELTI RUNAS
-- ================================
INSERT INTO runes (position, name, symbol, sound, meaning, keywords, interpretation, reversed_interpretation, element, aett) VALUES
(1, 'Fehu', 'ᚠ', 'F', 'Turtas, gyvuliai, mobilusis turtas', 
 ARRAY['Turtas', 'Energija', 'Sėkmė', 'Naujas pradžia'], 
 'Materialinė gerovė, nauji pradžiai, turtingumas. Energijos ir galios simbolis. Laikas investuoti ir augti. Judanti energija ir galimybės.',
 'Finansiniai sunkumai, prarastas turtas, nevykusi investicija. Reikia būti atsargiam su pinigais. Energijos stygius.',
 'Ugnis', 'Freyr'),

(2, 'Uruz', 'ᚢ', 'U', 'Stumbras, laukinė jėga', 
 ARRAY['Jėga', 'Sveikata', 'Drąsa', 'Ištvermė'], 
 'Fizinė jėga, sveikata, naujų galimybių pradžia. Laukinis ir nenuspėjamas energijos šaltinis. Pasitikėk savo vidinėmis galiomis.',
 'Silpnumas, praleistos galimybės, sveikatos problemos. Laikas atsistatyti. Baimė imtis iniciatyvos.',
 'Žemė', 'Freyr'),

(3, 'Thurisaz', 'ᚦ', 'TH', 'Milžinas, Thor, erškėtis', 
 ARRAY['Apsauga', 'Konfliktas', 'Katalizatorius', 'Ribos'], 
 'Gynybinė jėga, apsauga nuo priešų. Transformacija per iššūkius. Galimybė pažvelgti į save per sunkumus. Ribų nustatymas.',
 'Nesaugumas, pažeidžiamumas, vidinis konfliktas. Destruktyvios jėgos. Ribų perkirtimas.',
 'Ugnis', 'Freyr'),

(4, 'Ansuz', 'ᚨ', 'A', 'Dievas (Odin), pranešimas', 
 ARRAY['Išmintis', 'Komunikacija', 'Įkvėpimas', 'Ženklai'], 
 'Dieviškų ženklų gavimas, įkvėpimas, išmintis. Komunikacija su aukštesnėmis jėgomis. Laikas klausytis vidinės išminties ir ženklų.',
 'Nesusikalbėjimas, ignoruojami ženklai, blokuota išmintis. Sunku išreikšti mintis.',
 'Oras', 'Freyr'),

(5, 'Raidho', 'ᚱ', 'R', 'Kelionė, važiavimas, ratas', 
 ARRAY['Kelionė', 'Judėjimas', 'Ritmas', 'Progresija'], 
 'Gyvenimo kelias, fizinės ar dvasinės kelionės. Judėjimas teisinga kryptimi. Ritmas ir tvarka gyvenime. Pažanga link tikslo.',
 'Užstrigimas, kelionės vėlavimas, klaidinga kryptis. Trūksta judėjimo. Netinkamas laikas keliauti.',
 'Oras', 'Freyr'),

(6, 'Kenaz', 'ᚲ', 'K', 'Fakelas, ugnis, šviesa', 
 ARRAY['Ugnis', 'Žinojimas', 'Kūrybiškumas', 'Transformacija'], 
 'Vidinė ugnis, kūrybiškumas, aiškumas. Apšvietimas tamsiose situacijose. Transformacija per vidinę šviesą ir kūrybiškumą.',
 'Tamsumas, kūrybiškumo stygius, išdegimas. Vidinės ugnies praradimas. Neaiškumas.',
 'Ugnis', 'Freyr'),

(7, 'Gebo', 'ᚷ', 'G', 'Dovana', 
 ARRAY['Dovana', 'Partnerystė', 'Mainai', 'Harmonija'], 
 'Dovanos, mainai, partnerystė. Pusiausvyra tarp davimo ir gavimo. Santykiai ir bendradarbiavimas. Harmoningi mainai.',
 NULL,
 'Oras', 'Freyr'),

(8, 'Wunjo', 'ᚹ', 'W', 'Džiaugsmas, malonumas', 
 ARRAY['Džiaugsmas', 'Laimė', 'Harmonija', 'Pasitenkinimas'], 
 'Džiaugsmas, harmonija, sėkmė. Pasitenkinimas gyvenimu. Teigiamas periodas ir emocinė gerovė. Džiaukis dabartimi.',
 'Liūdesys, nepasitenkinimas, harmonijos stygius. Sunkumai rasti džiaugsmą. Atidėta sėkmė.',
 'Žemė', 'Freyr'),

(9, 'Hagalaz', 'ᚺ', 'H', 'Kruša', 
 ARRAY['Pokyčiai', 'Destrukcija', 'Transformacija', 'Katastrofa'], 
 'Gamtos jėgos, netikėti sukrėtimai, destrukcija vedanti į naujus pradžius. Priimk pokyčius kaip augimo galimybę.',
 NULL,
 'Ledas', 'Heimdall'),

(10, 'Nauthiz', 'ᚾ', 'N', 'Būtinybė, poreikis', 
 ARRAY['Poreikis', 'Vargas', 'Ištvermė', 'Atsparumas'], 
 'Iššūkiai, apribojimai, vargas. Augimas per sunkumus. Ištvermė ir atsparumas. Tikrų poreikių suvokimas.',
 'Pernelyg didelis vargas, desperacija, apribojimų vengimas. Neišmoktos pamokos kartojasi.',
 'Ugnis', 'Heimdall'),

(11, 'Isa', 'ᛁ', 'I', 'Ledas', 
 ARRAY['Ledas', 'Sustingimas', 'Laukimas', 'Koncentracija'], 
 'Sustabdymas, laukimas, koncentracija. Laikas ramybei ir apmąstymui. Situacija sustingusi, bet laikina.',
 NULL,
 'Ledas', 'Heimdall'),

(12, 'Jera', 'ᛃ', 'J', 'Metų laikas, derlius', 
 ARRAY['Derlius', 'Ciklai', 'Kantrybė', 'Rezultatai'], 
 'Derlius už įdėtą darbą, natūralūs ciklai, kantrybė. Teigiami rezultatai laiku. Viskas turi savo laiką.',
 NULL,
 'Žemė', 'Heimdall'),

(13, 'Eihwaz', 'ᛇ', 'EI', 'Tisa, medis', 
 ARRAY['Tisa', 'Ištvermė', 'Apsauga', 'Transformacija'], 
 'Ištvermė, apsauga, transformacija. Jungtis tarp pasaulių. Mirtis ir atgimimas. Vidinė jėga.',
 NULL,
 'Viskas', 'Heimdall'),

(14, 'Perthro', 'ᛈ', 'P', 'Kauliukų taurė, paslaptis', 
 ARRAY['Paslaptis', 'Likimas', 'Intuicija', 'Nežinomybė'], 
 'Paslaptys, nežinomybė, likimas. Priimk dalykus, kurių negali kontroliuoti. Pasitikėk intuicija.',
 'Paslėpti motyvai, nesurasta paslaptis, blokuota intuicija. Baimė nežinomybės.',
 'Vanduo', 'Heimdall'),

(15, 'Algiz', 'ᛉ', 'Z', 'Briedis, apsauga', 
 ARRAY['Apsauga', 'Gynimas', 'Dvasinė jungtis', 'Budumas'], 
 'Dvasinė apsauga, jungtis su aukštesnėmis jėgomis. Gynybinė energija. Būk budrus.',
 'Pažeidžiamumas, silpna apsauga, atsijungimas nuo dvasinių jėgų. Aplaidumas.',
 'Oras', 'Heimdall'),

(16, 'Sowilo', 'ᛊ', 'S', 'Saulė', 
 ARRAY['Saulė', 'Pergalė', 'Sėkmė', 'Energija'], 
 'Sėkmė, pergalė, aiškumas. Gyvenimo jėga ir energija. Šviesos ir tiesos simbolis. Spinduliuok.',
 NULL,
 'Ugnis', 'Heimdall'),

(17, 'Tiwaz', 'ᛏ', 'T', 'Tyr (karo dievas)', 
 ARRAY['Pergalė', 'Teisingumas', 'Karžygystė', 'Garbė'], 
 'Teisingumas, pergalė, karžygystė. Pasiaukojimas didesniam tikslui. Savikontrolė ir drąsa.',
 'Neteisingumas, pralaimėjimas, garbės praradimas. Silpna valia. Pralaimėta kova.',
 'Oras', 'Tyr'),

(18, 'Berkano', 'ᛒ', 'B', 'Beržas, motinystė', 
 ARRAY['Augimas', 'Gimimas', 'Motinystė', 'Atsinaujinimas'], 
 'Naujų pradžių, augimo, motiniško rūpesčio simbolis. Atsinaujinimas ir brandimas. Kūryba ir auginimas.',
 'Augimo sunkumai, stagnacija, nesėkmingi pradžiai. Rūpesčio stygius.',
 'Žemė', 'Tyr'),

(19, 'Ehwaz', 'ᛖ', 'E', 'Arklys', 
 ARRAY['Arklys', 'Judėjimas', 'Partnerystė', 'Pasitikėjimas'], 
 'Partnerystė, bendradarbiavimas, judėjimas į priekį. Pasitikėjimas ir lojalumas. Pažanga per komandą.',
 'Nesutarimai, sulėtėjimas, pasitikėjimo stygius. Bloga partnerystė.',
 'Žemė', 'Tyr'),

(20, 'Mannaz', 'ᛗ', 'M', 'Žmogus, žmogiškumas', 
 ARRAY['Žmogus', 'Bendruomenė', 'Savęs pažinimas', 'Intelektas'], 
 'Žmogiškumas, savęs pažinimas, bendruomenė. Vieta visuomenėje. Intelektas ir savianalizė.',
 'Izoliacija, savęs praradimas, atskirtis nuo bendruomenės. Ego problemos.',
 'Oras', 'Tyr'),

(21, 'Laguz', 'ᛚ', 'L', 'Vanduo, ežeras', 
 ARRAY['Vanduo', 'Intuicija', 'Emocijos', 'Tekėjimas'], 
 'Intuicija, emocijos, pasąmonė. Tekėjimas su gyvenimu. Įsiklausyk į jausmus ir sapnus.',
 'Emocinis chaosas, blokuota intuicija, pasipriešinimas tekėjimui. Nuskendimas emocijose.',
 'Vanduo', 'Tyr'),

(22, 'Ingwaz', 'ᛜ', 'NG', 'Ing (dievas), vaisingumas', 
 ARRAY['Vaisingumas', 'Potencialas', 'Užbaigimas', 'Naujas pradžia'], 
 'Vaisingumas, potencialo išskleidimas. Ciklo užbaigimas ir naujo pradžia. Vidinė energija bręstanti.',
 NULL,
 'Žemė', 'Tyr'),

(23, 'Dagaz', 'ᛞ', 'D', 'Diena, aušra', 
 ARRAY['Diena', 'Proveržis', 'Transformacija', 'Aiškumas'], 
 'Proveržis, transformacija, aiškumas. Perėjimas iš tamsos į šviesą. Apšvietimas ir nauja perspektyva.',
 NULL,
 'Šviesa', 'Tyr'),

(24, 'Othala', 'ᛟ', 'O', 'Paveldas, šeimos žemė', 
 ARRAY['Paveldas', 'Šeima', 'Tradicijos', 'Šaknys'], 
 'Paveldėtas turtas, šeimos vertybės, tradicijos. Šaknys ir priklausymas. Materialinis ir dvasinis paveldas.',
 'Paveld praradimas, šeimos konfliktai, tradicijų atmetimas. Šaknų neigimas.',
 'Žemė', 'Tyr');
