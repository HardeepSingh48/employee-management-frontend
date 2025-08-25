# 🏦 Deductions Module

## Overview
The Deductions Module extends the existing salary management system by adding support for employee deductions that are automatically calculated and applied during salary processing.

## 🎯 Features

### Core Functionality
- **Deduction Management**: Create, edit, and delete employee deductions
- **Automatic Calculation**: Deductions are automatically calculated in salary processing
- **Flexible Duration**: Support for any number of months (3, 6, 9, 12, 15, etc.)
- **Bulk Operations**: Bulk upload deductions via Excel/CSV files
- **Status Tracking**: Track active vs completed deductions

### Integration
- **Salary Calculation**: Seamlessly integrated with existing salary calculation logic
- **Dynamic Fields**: Deduction types appear as dynamic fields in salary reports
- **Backward Compatibility**: Existing salary logic remains unchanged

## 🗄️ Database Schema

### Deductions Table
```sql
CREATE TABLE deductions (
    deduction_id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    deduction_type VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    months INTEGER NOT NULL,
    start_month DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
```

### Key Fields
- **deduction_id**: Unique identifier (UUID)
- **employee_id**: Foreign key to employees table
- **deduction_type**: Type of deduction (e.g., "Clothes", "Loan", "Recovery")
- **total_amount**: Total amount to be deducted
- **months**: Number of months to spread the deduction
- **start_month**: First month from which deduction applies

## 🔧 Backend Implementation

### Models
- **Deduction Model** (`models/deduction.py`): Core model with helper methods
- **Helper Methods**:
  - `monthly_installment()`: Calculate monthly installment amount
  - `is_active_for_month(year, month)`: Check if deduction is active
  - `get_installment_for_month(year, month)`: Get installment for specific month

### Services
- **SalaryService Extension** (`services/salary_service.py`):
  - `get_monthly_deductions(employee_id, year, month)`: Get deductions for salary calculation
  - Returns: `(total_deduction, deduction_details_dict)`

### API Routes
- **CRUD Operations** (`routes/deductions.py`):
  - `GET /api/deductions`: Get all deductions
  - `POST /api/deductions`: Create new deduction
  - `PUT /api/deductions/{id}`: Update deduction
  - `DELETE /api/deductions/{id}`: Delete deduction
  - `GET /api/deductions/employee/{id}`: Get employee deductions
  - `POST /api/deductions/bulk`: Bulk upload
  - `GET /api/deductions/template`: Download template

## 🎨 Frontend Implementation

### Components
- **DeductionsPage** (`app/dashboard/deductions/page.tsx`): Main management page
- **AddDeductionModal** (`components/deductions/AddDeductionModal.tsx`): Add new deduction
- **EditDeductionModal** (`components/deductions/EditDeductionModal.tsx`): Edit existing deduction
- **BulkUploadModal** (`components/deductions/BulkUploadModal.tsx`): Bulk upload interface

### Services
- **DeductionsService** (`lib/deductions-service.ts`): Frontend API service

### Integration
- **Supervisor Dashboard**: New "Deductions" tab added
- **Salary Reports**: Dynamic deduction fields in salary breakdown
- **Navigation**: Updated sidebar navigation

## 📊 Salary Calculation Integration

### How It Works
1. **Salary Calculation**: When calculating salary, the system calls `get_monthly_deductions()`
2. **Deduction Processing**: For each active deduction:
   - Check if deduction is active for the month
   - Calculate monthly installment
   - Add to total deductions
   - Add to deduction details
3. **Result Integration**: Deductions are added to salary result with dynamic fields

### Example Output
```json
{
  "Employee ID": 910001,
  "Employee Name": "PRADIPTA DAS",
  "Skill Level": "Skilled",
  "Present Days": 24,
  "Daily Wage": 739,
  "Basic": 17736,
  "PF": 1800,
  "ESIC": 133,
  "Clothes": 2222,
  "Loan": 2000,
  "Total Earnings": 17736,
  "Total Deductions": 6135,
  "Net Salary": 11601
}
```

## 🚀 Usage Examples

### Creating a Deduction
```javascript
// Frontend
const deductionData = {
  employee_id: "910001",
  deduction_type: "Clothes",
  total_amount: 20000,
  months: 9,
  start_month: "2025-08-01"
};

await deductionsService.createDeduction(deductionData);
```

### Bulk Upload
1. Download template from `/api/deductions/template`
2. Fill in Excel/CSV with required columns:
   - Employee ID
   - Deduction Type
   - Total Amount
   - Months
   - Start Month
3. Upload via bulk upload interface

### Salary Calculation
```python
# Backend
total_deduction, deduction_details = SalaryService.get_monthly_deductions(
    employee_id="910001", 
    year=2025, 
    month=9
)
# Returns: (4222, {"Clothes": 2222, "Loan": 2000})
```

## 🔍 Testing

### Database Setup
```bash
# Create deductions table
python create_deductions_table.py

# Test functionality
python test_deductions.py
```

### Manual Testing
1. **Create Deduction**: Use the frontend interface to create a deduction
2. **Calculate Salary**: Run salary calculation for the employee
3. **Verify Integration**: Check that deductions appear in salary breakdown
4. **Test Expiry**: Verify deductions stop after the specified months

## 📋 Requirements Met

✅ **Deduction Model**: Created with all required fields and helper methods  
✅ **SalaryService Integration**: Added `get_monthly_deductions()` method  
✅ **Salary Calculation Extension**: Integrated into existing calculation logic  
✅ **Bulk Upload Support**: Excel/CSV upload with validation  
✅ **Frontend Management**: Complete UI for deductions management  
✅ **Supervisor Dashboard**: New tab with full functionality  
✅ **Dynamic Fields**: Deduction types appear in salary reports  
✅ **Backward Compatibility**: Existing salary logic unchanged  

## 🎯 Key Benefits

1. **Automated Processing**: Deductions are automatically calculated and applied
2. **Flexible Duration**: Support for any number of months
3. **Easy Management**: User-friendly interface for supervisors
4. **Bulk Operations**: Efficient handling of multiple deductions
5. **Seamless Integration**: Works with existing salary system
6. **Dynamic Display**: Deduction types appear as needed in reports

## 🔮 Future Enhancements

- **Deduction Categories**: Predefined categories with validation
- **Advanced Scheduling**: More complex deduction schedules
- **Deduction History**: Track changes and modifications
- **Notifications**: Alert when deductions are about to expire
- **Reporting**: Dedicated deduction reports and analytics
