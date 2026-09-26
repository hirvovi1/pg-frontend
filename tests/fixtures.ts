import { test as base } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

export const test = base.extend<{}, { dbReset: void }>({
    dbReset: [async ({}, use) => {
        console.log('--- JUnit-tyylinen H2-kannan alustus: Käynnistetään mikropalvelut puhtaana ---');

        // DYNAAMISET POLUT: Jos ajetaan CI:ssä, kaverirepot ovat alikansioissa.
        // Lokaalisti Ville-koneella ne ovat askeleen ylempänä samassa react-kansiossa (../repo)
        const pgapiPath = process.env.CI
            ? 'pgapi/compose.yaml'
            : '/home/ville/IdeaProjects/pgapi/compose.yaml'; // ← Muuta tämä tarvittaessa lokaalin polkusi mukaan

        const platformPath = process.env.CI
            ? 'pg-backend-platform/docker-compose.yaml'
            : '/home/ville/IdeaProjects/pg-backend-platform/docker-compose.yaml';

        try {
            // 1. Sammutetaan vanhat kontit ja pyyhitään niiden muisti
            execSync(`docker compose -f ${pgapiPath} down -v`, { stdio: 'ignore' });
            execSync(`docker compose -f ${platformPath} down -v`, { stdio: 'ignore' });

            // 2. Käynnistetään kontit täysin puhtaana alusta
            execSync(`docker compose -f ${pgapiPath} up -d`, { stdio: 'ignore' });
            execSync(`docker compose -f ${platformPath} up -d`, { stdio: 'ignore' });

            // 3.  Odotetaan aktiivisesti, että Core API vastaa 200 OK ennen testejä
            console.log('Odotetaan, että backend-klusteri herää unestaan...');
            let backendReady = false;

            for (let i = 0; i < 15; i++) {
                try {
                    execSync('curl --silent --fail http://localhost:8080/accounts', { stdio: 'ignore' });
                    backendReady = true;
                    console.log('Backend on pystyssä ja valmis ottamaan vastaan testejä!');
                    break;
                } catch {
                    execSync('sleep 2');
                    console.log(".")
                }
            }

            if (!backendReady) {
                console.warn('Varoitus: Backend ei vastannut 30 sekunnissa, aloitetaan testit silti...');
            }

        } catch (error) {
            console.error('Docker alustus epäonnistui:', error);
        }


        // Tässä kohtaa Playwright ajaa itse testitiedoston sisältämät testit
        await use();

        // Testien JÄLKEEN ajettava koodi (Teardown)
        console.log('--- Testit ajettu: Siivotaan Docker-kontit pois ---');
        try {
            execSync(`docker compose -f ${pgapiPath} down -v`, { stdio: 'ignore' });
            execSync(`docker compose -f ${platformPath} down -v`, { stdio: 'ignore' });
        } catch (teardownError) {
            console.error('Docker siivous epäonnistui:', teardownError);
        }
    }, { scope: 'worker', auto: true }],
});

export { expect } from '@playwright/test';
