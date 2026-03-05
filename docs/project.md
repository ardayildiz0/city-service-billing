process:
-you must use fastapi, pydantic, sqlalchemy, postgresql
-there must be a script for superadmin creation
-superadmin must be able to create admins and user
-superadmin must be able to reach every endpoint
-admins can only reach data from cities that superadmins gave permission to


-developer creates a superadmin using script during setup process 
-superadmin logs into application 
-superadmin creates admins and assigns them to cities 
-superadmin creates taxes and their rates (e.g. KDV 20%)
-superadmin creates currencies list (e.g. dollar, euro, turkish lira)
-superadmin creates providers (e.g. amazon, microsoft)
-superadmin creates services (e.g. ec2clpud computing, datastore)
-superadmin creates catalog (provider x service duals e.g. cloud computing from amazon) and sets monthly unit prices for them (e.g. 0.003 dollars for mbps/month)
-superadmin can change prices whenever they want (subscription phase change must be triggered. more on that later) 

-admins logs into system 
-admin subscribes their cities to services from catalog and choose amount (e.g. 10gbps of vpn) as much as they want
-admins can change amount whenever they want tp whatever they want (subscription phase change must be triggered. more on that later) 

subscription phase change:
-when price or amount of a subscription changes a postgresql transaction must happen
-this change must be logged to subscription_phases (stores state history) table which consist of id (pk), subscription_id (fk), provider_service_id (foreign key provider_services.id), start_time (timestamo), end_time (timestamp, nullable)

cron jobs:
-daily usage calculation 
-monthly usage and price calculation using state history

-if more than one phase happens in a day last phase’s price must be applied to all day
-for this application smallest unit of time must be “day”

example:
01.01.2026: ankara admin subscribes ankara to amazon data store (0.5 dollars for gb/month) for 200gb. 
04.012026: ankara admin changes their subscription amount to 120gb.
20.01.2025: ankara admin changes their subscription amount to 250gb.
24.01.2026: superadmin changes price of amazon datastore to 0.6 dollars for gb/month) 

10+32+16,6666667+36‎ = 94,667 dollars total + taxes 


superadmins must be able to see every cities usage data on pie chart and must be able to create monthly invoices for each of them.
admin must be able to do the same for their city only.

techstacks:
backend: fastapi, postgresql, pydantic
frontend: vite, react