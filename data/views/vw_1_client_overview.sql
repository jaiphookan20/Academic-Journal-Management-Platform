create or replace view vw_client_overview as
    select
        clients.client_id,
        clients.first_name,
        clients.last_name,
        clients.email,
        clients.created_at as client_created_at,

        roles.role_name,
        
        client_role.assigned_time,
        client_role.last_login
    from client_role
    inner join clients using (client_id)
    inner join roles using (role_id)
;

