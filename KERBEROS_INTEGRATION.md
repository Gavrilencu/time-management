# KPI Time Tracker - Integrare Kerberos

## Autentificare Automată cu Kerberos

Aplicația KPI Time Tracker este configurată pentru autentificare automată prin Kerberos. Utilizatorii sunt creați automat în baza de date când se autentifică pentru prima dată.

## Implementare Curentă

### 1. Funcția Kerberos Simulată (`src/lib/kerberos.ts`)

```typescript
export async function getKerberosUser(): Promise<KerberosUser> {
    // Simulare pentru demo - înlocuiește cu implementarea reală
    return {
        username: 'john.doe',
        email: 'john.doe@company.com',
        displayName: 'John Doe',
        domain: 'COMPANY',
        groups: ['Users', 'Developers']
    };
}
```

### 2. Fluxul de Autentificare (`src/routes/+layout.svelte`)

1. **Încărcare**: Aplicația încearcă să obțină datele utilizatorului prin Kerberos
2. **Verificare**: Verifică dacă utilizatorul există în baza de date
3. **Creare automată**: Dacă nu există, creează utilizatorul automat
4. **Autentificare**: Setează utilizatorul ca autentificat

### 3. Store de Autentificare (`src/lib/auth.ts`)

- `currentUser`: Store pentru utilizatorul curent
- `isAuthenticated`: Store pentru starea de autentificare
- `authLoading`: Store pentru starea de loading

## Implementare Kerberos Reală

### Opțiuni de Implementare

#### 1. Windows SSPI (Recomandat pentru Windows)

```typescript
// Pentru Windows cu Active Directory
export async function getKerberosUser(): Promise<KerberosUser> {
    // Folosește Windows Authentication
    const response = await fetch('/api/auth/windows', {
        credentials: 'include'
    });
    
    if (!response.ok) {
        throw new Error('Windows authentication failed');
    }
    
    return response.json();
}
```

#### 2. Backend Integration

```python
# backend/main.py - Adaugă endpoint pentru Kerberos
@app.get("/api/auth/windows")
async def windows_auth(request: Request):
    # Implementează verificarea token-ului Windows
    # Returnează datele utilizatorului
    pass
```

#### 3. Node.js Kerberos Library

```typescript
// Pentru Node.js backend
import { authenticate } from 'kerberos';

export async function authenticateKerberos(token: string) {
    // Implementează autentificarea Kerberos
}
```

### Configurare pentru Implementare Reală

#### 1. Înlocuiește Funcția Simulată

Editează `src/lib/kerberos.ts`:

```typescript
export async function getKerberosUser(): Promise<KerberosUser> {
    // TODO: Înlocuiește cu implementarea reală
    // Exemplu pentru Windows:
    try {
        const response = await fetch('/api/auth/windows', {
            credentials: 'include',
            headers: {
                'Authorization': 'Negotiate'
            }
        });
        
        if (!response.ok) {
            throw new Error('Kerberos authentication failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Kerberos error:', error);
        throw error;
    }
}
```

#### 2. Configurează Backend-ul

Adaugă în `backend/main.py`:

```python
from fastapi import Request
import base64

@app.get("/api/auth/windows")
async def windows_auth(request: Request):
    # Extrage token-ul Kerberos din header
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Negotiate '):
        raise HTTPException(status_code=401, detail="No Kerberos token")
    
    token = auth_header[10:]  # Remove 'Negotiate '
    
    # Verifică token-ul Kerberos
    # Implementează logica de verificare
    
    # Returnează datele utilizatorului
    return {
        "username": "john.doe",
        "email": "john.doe@company.com",
        "displayName": "John Doe",
        "domain": "COMPANY"
    }
```

#### 3. Configurare IIS/Apache (pentru Windows)

```xml
<!-- web.config pentru IIS -->
<system.webServer>
    <security>
        <authentication>
            <windowsAuthentication enabled="true" />
            <anonymousAuthentication enabled="false" />
        </authentication>
    </security>
</system.webServer>
```

### Testare

1. **Testează funcția simulată**: Aplicația funcționează cu datele simulate
2. **Implementează funcția reală**: Înlocuiește simularea cu implementarea Kerberos
3. **Testează în mediul de producție**: Verifică că autentificarea funcționează

### Caracteristici

- ✅ **Autentificare automată**: Utilizatorii se autentifică automat
- ✅ **Creare automată**: Utilizatorii noi sunt creați automat în baza de date
- ✅ **Store centralizat**: Starea de autentificare este gestionată central
- ✅ **Fallback**: Dacă Kerberos eșuează, aplicația funcționează în mod demo
- ✅ **Logout**: Funcția de logout este pregătită pentru Kerberos real

### Următorii Pași

1. **Configurează Kerberos** în mediul de producție
2. **Înlocuiește funcția simulată** cu implementarea reală
3. **Testează autentificarea** cu utilizatori reali
4. **Configurează logout-ul** Kerberos dacă este necesar

Aplicația este pregătită pentru integrarea Kerberos reală! 🎉
