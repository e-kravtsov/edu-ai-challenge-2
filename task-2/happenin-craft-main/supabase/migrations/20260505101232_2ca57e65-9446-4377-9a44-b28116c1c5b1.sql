
REVOKE EXECUTE ON FUNCTION public.is_host_member(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_host_role(uuid, uuid, host_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_host_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_host_role(uuid, uuid, host_role) TO authenticated;
