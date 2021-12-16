# Speedup server

Server layer for Galileo which allow to download more tiles simultaneously. 

Current web standards (RFC2616) allow only six connections per domain. To solve this limitations we can make requests to subdomains. The server app should be available from different domains to manage user's cookies and make requests to FairOS-dfs.

# Should be implemented

-Tiles caching

-Public version of Galileo?
