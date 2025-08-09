# Page snapshot

```yaml
- banner:
  - heading "TappHA" [level=1]
  - text: Home Assistant Integration
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
    - link "Connections":
      - /url: /connections
    - link "Events":
      - /url: /events
- main:
  - heading "Home Assistant Connection" [level=2]
  - text: Connection Name
  - textbox "Connection Name"
  - text: Home Assistant URL
  - textbox "Home Assistant URL"
  - paragraph: Enter the full URL of your Home Assistant instance
  - text: Long-Lived Access Token
  - textbox "Long-Lived Access Token"
  - paragraph: Create a long-lived access token in your Home Assistant profile settings
  - button "Connect"
  - button "Show Test Mode"
  - heading "Connection Status" [level=2]
  - heading "Event Monitoring" [level=2]
  - heading "No Connections Available" [level=3]
  - paragraph: Please add a Home Assistant connection to monitor events.
```