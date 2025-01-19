Essensial features

Core booking features:
1) Appointment Management
   (Customer Side)
  - Basic booking creation (done)
  - View available time slots (done)
  - Cancel/reschedule appointments (done)
  - Email Confirmation (done)
  - Basic reminder system [24h before] 

  (Business side)
  - Business hours setup
  - Service list
  - Resource list
  - Dashboard to view upcoming bookings
  - Receive Payment
  - Unique Booking Reference (id of booking)
  - Authentication
  - View Customer Details per Booking

In Hapio, we need to constantly set schedules, we need to:
1) create Services, Locations, Resources (can be done once)
2) connect the resource with service
3) set up schedule
   3.1) set up recurring schedule for resource, takes resource_id -> endpoint = "/v1/resources/{resource_id}/recurring-schedules"
   3.2) create schedule blocks in the recurring schedule that is just created -> endpoint = "/v1/resources/{resource_id}/recurring-schedules/{recurring_schedule_id}/schedule-blocks"
   it takes json body containing weekday, start time, end time.

Assuming Hapio automatically creates new schedules for you once you set the recurring-schdule time and block.
3.1) tells hapio how many days in a week this resource is working.
3.2) tells hapio what chunk within each day resource is working, then hapio will calculate how many slots does a particular resource has throughout a day, everyday.
