-- Better Auth identifies email/password credentials by both provider_id and
-- account_id. For the credential provider, account_id must equal user_id.
-- Earlier local bootstrap and partner-invite code generated a separate UUID,
-- which made valid users appear missing during sign-in.
update account
set account_id = user_id,
    updated_at = now()
where provider_id = 'credential'
  and account_id <> user_id;
