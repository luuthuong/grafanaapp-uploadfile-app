import { getBackendSrv } from "@grafana/runtime";
import { useCallback, useEffect, useState } from "react";

type Org = {
    orgId: number;
    name: string;
    role: 'Editor' | 'Admin' | 'Viewer';
}

type User = {
    id: number;
    uid: string;
    email: string;
    name: string;
    login: string;
    theme: string;
    orgId: number;
    isGrafanaAdmin: boolean;
    isDisabled: boolean;
    isExternal: boolean;
    isExternallySynced: boolean;
    isGrafanaAdminExternallySynced: boolean;
    authLabels: string[];
    updatedAt: string;
    createdAt: string;
    avatarUrl: string;
    isProvisioned: boolean;
    orgs: Org[];
}


export function useCurrentUser() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUser().then(({user, orgs}) => {
            user.orgs = orgs;
            setUser(user);
        });
    }, []);

    const fetchUser = useCallback(async () =>{
        const [user, orgs] = await Promise.all([
            getBackendSrv().get('/api/user'),
            getBackendSrv().get('/api/user/orgs')
        ]);
        return {user, orgs};
    }, []);
    
    return {
        user
    }
}