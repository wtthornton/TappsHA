# Real Home Assistant Integration Test Plan

## Test Environment
- **Home Assistant URL**: http://192.168.1.86:8123/
- **Frontend URL**: http://localhost:5173/
- **Backend URL**: http://localhost:8080/
- **Token**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhMGFkZGI3OWQ5MGQ0N2MzYTFiNGZjMDgxOWRkYjk1NCIsImlhdCI6MTc1NDQ1NTg3MywiZXhwIjoyMDY5ODE1ODczfQ.auW_zmVvy3lfKSJ20z8dOSDbg8Ae_KkVjFdBlGn0ThY

## Test Plan Overview

### Phase 1: Basic Connectivity ✅
- [x] Verify Home Assistant API is accessible
- [x] Test authentication with provided token
- [x] Confirm API endpoints respond correctly

### Phase 2: Frontend Connection Form Testing
- [ ] Open TappHA frontend at http://localhost:5173/
- [ ] Fill connection form with HA details
- [ ] Test connection validation
- [ ] Verify connection creation

### Phase 3: WebSocket Integration Testing
- [ ] Test WebSocket authentication flow
- [ ] Subscribe to state_changed events
- [ ] Verify real-time event streaming
- [ ] Test reconnection logic

### Phase 4: Dashboard Real-Time Updates
- [ ] Verify connection status display
- [ ] Test health metrics updates
- [ ] Validate real-time data refresh

### Phase 5: Event Monitoring
- [ ] Test event filtering
- [ ] Verify event search functionality
- [ ] Validate event details display

## Expected WebSocket Flow (from Context7 docs)

### 1. Authentication Phase
```json
// Server sends
{"type": "auth_required", "ha_version": "2021.5.3"}

// Client sends
{"type": "auth", "access_token": "TOKEN"}

// Server sends on success
{"type": "auth_ok", "ha_version": "2021.5.3"}
```

### 2. Feature Enablement
```json
// Client sends first message
{"id": 1, "type": "supported_features", "features": {"coalesce_messages": 1}}
```

### 3. Subscribe to Events
```json
// Client sends
{"id": 18, "type": "subscribe_events", "event_type": "state_changed"}

// Server confirms
{"id": 18, "type": "result", "success": true, "result": null}
```

### 4. Event Streaming
```json
// Server sends events
{
   "id": 18,
   "type":"event",
   "event":{
      "data":{
         "entity_id":"light.bed_light",
         "new_state":{ ... },
         "old_state":{ ... }
      },
      "event_type":"state_changed",
      "time_fired":"2016-11-26T01:37:24.265429+00:00"
   }
}
```

## Test Execution Status

### ✅ Completed Tests
1. **API Connectivity**: Home Assistant API responding with "API running."
2. **Infrastructure**: All Docker services running correctly
3. **Applications**: Frontend (port 5173) and backend services available

### 🔄 Ready for Testing
- Frontend connection form
- Real-time WebSocket integration
- Dashboard updates
- Event monitoring

## Success Criteria
- [ ] Successful connection to Home Assistant instance
- [ ] Real-time events streaming properly
- [ ] Dashboard showing live connection metrics
- [ ] Event filtering and search working
- [ ] Error handling working correctly
- [ ] Reconnection logic functioning

## Test Results
_To be updated during testing_

---
**Created**: 2025-01-27  
**Status**: Ready for Execution  
**Next Step**: Test frontend connection form