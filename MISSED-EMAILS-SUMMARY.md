# Complete List of Missed Email Notifications

## Summary

All submissions made **before December 20, 2025** likely missed email notifications due to the SES email verification issue (using `create@potterychicago.com` instead of `Create@potterychicago.com`).

---

## 📧 Private Party Bookings (10 total)

### Unique Email Addresses: 6

1. **mmcalisteryoung@gmail.com** (Maria Young)
   - 2 bookings on Dec 20, 2025
   - Birthday events, 14 people each
   - ✅ One email already sent manually

2. **kjnijn@gmail.com** (lkm)
   - 1 booking on Dec 15, 2025
   - Corporate event, 8 people

3. **q2312@gmail.coma** (asadasdasda)
   - 1 booking on Dec 5, 2025
   - Corporate event, 8 people
   - ⚠️ Note: Email has typo (ends with "a")

4. **mikevicentecs@gmail.com** (Multiple names)
   - 4 bookings total:
     - Nov 28, 2025 - Testing Jonny (Corporate, 8 people)
     - Nov 28, 2025 - mike vicente (Other Gathering, 8 people)
     - Nov 27, 2025 - Mike (Corporate, 12 people)
     - Nov 27, 2025 - Mike (Corporate, 12 people)

5. **sarah101assaf@gmail.com** (Sarah Assaf)
   - 1 booking on Nov 28, 2025
   - Birthday event, 8 people

6. **PotteryChicago@gmail.com** (Michael Vicente)
   - 1 booking on Nov 27, 2025
   - Other Gathering, 3 people

---

## 👨‍🏫 Instructor/Staff Applications (2 total)

### Unique Email Addresses: 2

1. **asd@gmail.com** (sadasdas)
   - Application ID: `INST-1764892735149-iljaojxtb`
   - Date: Dec 5, 2025, 08:58 AM
   - Experience: both

2. **mikevicentecs@gmail.com** (Mike)
   - Application ID: `INST-1764233018425-03eimgc6a`
   - Date: Nov 27, 2025, 05:43 PM
   - Experience: Both

---

## 🤝 Collaboration Applications (1 total)

### Unique Email Addresses: 1

1. **mikevicentecs@gmail.com** (Mike)
   - Collaboration ID: `COLLAB-1764232988142-7poe35jeh`
   - Date: Nov 27, 2025, 05:43 PM
   - Organization: Chicago Art Collective
   - Event Type: Community workshop and collaborative art event
   - Expected Attendance: 50-75 people

---

## 📊 Grand Total

- **Total Submissions:** 13
- **Unique Email Addresses:** 8
- **Private Party Bookings:** 10
- **Instructor Applications:** 2
- **Collaboration Applications:** 1

---

## 🔧 How to Send Missed Emails

### For Private Party Bookings:
```bash
# Send email for a specific booking
node send-missed-booking-email.js

# Send emails for ALL recent bookings (last 7 days)
node send-missed-booking-email.js --all
```

### For Instructor Applications:
You'll need to create a similar script or manually send emails. The applications are stored in the `InstructorApplications` table.

### For Collaboration Applications:
You'll need to create a similar script or manually send emails. The collaborations are stored in the `Collaborations` table.

---

## ✅ Fix Status

- ✅ All Lambda functions updated to use `Create@potterychicago.com` (verified email)
- ⚠️ **Action Required:** Deploy updated Lambda functions to AWS
- ✅ Email notification sent for: Maria Young (mmcalisteryoung@gmail.com) - Dec 20 booking

---

## 📝 Notes

- All data is safely stored in DynamoDB - no data was lost
- The issue was only with email notifications, not data storage
- Once Lambda functions are deployed with the fix, all future submissions will send emails correctly
- You may want to send delayed notifications for the missed submissions listed above


