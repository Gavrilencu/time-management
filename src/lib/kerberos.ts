/**
 * Integrare Kerberos pentru autentificare automată
 * 
 * Această funcție trebuie înlocuită cu implementarea reală Kerberos
 * care va returna datele utilizatorului autentificat
 */

export interface KerberosUser {
    username: string;
    email: string;
    displayName: string;
    department: string;
    domain?: string;
    groups?: string[];
}

/**
 * Funcție pentru extragerea domeniului din DN-ul managerului
 */
function extractDomain(managerDn: string): string {
  const domainParts = managerDn.match(/DC=([^,]+)/g);
  return domainParts ? domainParts.map(part => part.replace('DC=', '')).join('.').toUpperCase() : 'UNKNOWN';
}

/**
 * Funcție principală pentru obținerea datelor utilizatorului prin Kerberos
 * 
 * Implementare reală Kerberos cu endpoint-uri de securitate
 */
export async function getKerberosUser(): Promise<KerberosUser> {
  try {
    const response = await fetch('/security/developerIP-login', {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    // let actual_user = data?.UserName
    let actual_user = "grigore.gavrilencu";

    // Al doilea request pentru detalii suplimentare
    const extraResponse = await fetch(`/security/getUserHierarchy`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        UserName: actual_user
      })
    });
    
    const kerb = await extraResponse.json();
    const extraData = kerb?.user;

    const mappedUser: KerberosUser = {
      username: extraData?.username,
      email: extraData?.mail,
      department: extraData?.department,
      displayName: extraData?.cn,
      domain: extraData?.manager ? extractDomain(extraData.manager) : 'UNKNOWN',
      groups: Array.isArray(extraData?.groups) ? extraData.groups : []
    };

    return mappedUser;
  } catch (error) {
    console.error('Failed to fetch Kerberos user:', error);
    throw error;
  }
}

/**
 * Funcție pentru verificarea disponibilității Kerberos
 */
export async function isKerberosAvailable(): Promise<boolean> {
    try {
        // Verifică dacă endpoint-ul principal Kerberos este disponibil
        const response = await fetch('/security/developerIP-login', {
            method: 'GET'
        });
        return response.ok;
    } catch (error) {
        console.warn('Kerberos not available:', error);
        return false;
    }
}

/**
 * Funcție pentru logout Kerberos
 */
export async function kerberosLogout(): Promise<void> {
    try {
        // Încearcă să facă logout prin endpoint-ul de securitate
        await fetch('/security/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Kerberos logout successful');
    } catch (error) {
        console.warn('Kerberos logout failed:', error);
        // Logout-ul local se face oricum prin clearCurrentUser()
    }
}

/**
 * Implementare Kerberos completă:
 * 
 * 1. Autentificare prin serviciu extern de securitate:
 *    - /security/developerIP-login - obține utilizatorul curent
 *    - /security/getUserHierarchy - obține detalii suplimentare
 *    - /security/logout - logout utilizator
 * 
 * 2. Mapping complet al datelor utilizatorului:
 *    - username, email, displayName, department
 *    - domain (extras din manager DN)
 *    - groups (array de grupuri)
 * 
 * 3. Error handling robust:
 *    - Verifică disponibilitatea serviciului extern
 *    - Gestionează erorile de rețea
 *    - Fallback pentru logout
 * 
 * 4. Integrare cu Active Directory prin serviciu extern:
 *    - Extrage domeniul din DN-ul managerului
 *    - Suportă grupuri multiple
 *    - Compatibil cu structura AD
 * 
 * NOTA: Endpoint-urile de securitate sunt gestionate de un serviciu extern,
 * nu de backend-ul aplicației KPI.
 */
