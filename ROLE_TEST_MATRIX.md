# Role Test Matrix & RBAC Policy

| Feature Area | Command / Page | ADMIN | TEACHER | FINANCE | Notes |
|---|---|---|---|---|---|
| **Core** | Login | ✅ | ✅ | ✅ | |
| | Dashboard | ✅ (Full) | ✅ (Edu) | ✅ (Fin) | Different dashboards per role |
| **Students** | List Students | ✅ | ✅ | ✅ | Finance sees minimal columns only |
| | View Profile | ✅ | ✅ | ❌ | Finance sees only Finance Profile |
| | Edit Sensitive | ✅ | ❌ | ❌ | Address, Contacts |
| **Education** | View Attendance | ✅ | ✅ | ❌ | |
| | Take Attendance| ✅ | ✅ | ❌ | |
| | View Grades | ✅ | ✅ | ❌ | |
| | Enter Grades | ✅ | ✅ | ❌ | |
| | Notes/Interv. | ✅ | ✅ | ❌ | |
| **Finance** | Fee Plans | ✅ | ❌ | ✅ | |
| | Invoices | ✅ | ❌ | ✅ | |
| | Payments | ✅ | ❌ | ✅ | |
| **System** | User Mgmt | ✅ | ❌ | ❌ | |
| | Audit Log | ✅ | ❌ | ❌ | |
| | Backup/Restore | ✅ | ❌ | ❌ | |
| | CSV Import | ✅ | ✅ (Edu) | ❌ | Finance import disabled for V1 safety |

**Strict Backend Enforcement:**
1. `finance_*` commands MUST fail if caller is TEACHER.
2. `education_*` commands MUST fail if caller is FINANCE.
3. `get_student_details` MUST return stripped struct if caller is FINANCE.
