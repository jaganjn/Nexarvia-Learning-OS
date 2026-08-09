# Security Notes

- Never commit production secrets.
- Use a managed secret store in production.
- Use HTTPS/TLS at the edge.
- Put shared rate limiting at the gateway/Redis layer for multiple API replicas.
- Restrict database network access.
- Rotate JWT/signing secrets.
- Add object-storage malware scanning for uploaded PDFs.
- Log privileged actions to the audit log.
- Review retention/deletion and privacy requirements before launch.
- Run dependency, SAST, DAST and penetration testing before public release.
