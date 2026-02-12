# KAAS Backend API Contract (Branch-Aware School)

This frontend expects a single school tenant with branch support.

## Core rules
- Every entity is scoped by `schoolId` and `branchId` where applicable.
- `proprietor` and `headmaster` must have equivalent management permissions.
- `class_teacher` is a teacher assignment state, not a separate staff table.
- Terminal reports must support delivery channels: `whatsapp`, `email`, `pdf_download`.
- Bulk data operations use Excel templates and async import jobs.

## Recommended roles
- `proprietor`
- `administrator`
- `headmaster`
- `subject_teacher`
- `class_teacher`
- `student`

## Suggested .NET DTOs
```csharp
public record BranchDto(
    Guid Id,
    Guid SchoolId,
    string Code,
    string Name,
    string Email,
    string Phone,
    string Address,
    string State,
    string District,
    string Country,
    string Timezone,
    string RegistrationNumber,
    string? TaxNumber,
    bool IsActive
);

public record StudentDto(
    Guid Id,
    Guid SchoolId,
    Guid BranchId,
    string AdmissionNo,
    string FullName,
    string ClassName,
    string Section,
    string RollNumber,
    string GuardianPhone
);

public record AssessmentDto(
    Guid Id,
    Guid SchoolId,
    Guid BranchId,
    string ClassName,
    string Subject,
    string Term,
    decimal MaxScore,
    DateOnly AssessmentDate,
    Guid CreatedBy
);

public record TerminalReportDto(
    Guid Id,
    Guid SchoolId,
    Guid BranchId,
    Guid StudentId,
    string Term,
    decimal ScorePercent,
    string Grade,
    DateTime GeneratedAt,
    IReadOnlyList<string> DeliveryChannels
);
```

## Endpoints to implement
- `GET /api/v1/schools/{schoolId}/branches`
- `POST /api/v1/schools/{schoolId}/branches`
- `GET /api/v1/schools/{schoolId}/users?branchId=&role=`
- `POST /api/v1/schools/{schoolId}/users`
- `GET /api/v1/schools/{schoolId}/students?branchId=&className=`
- `POST /api/v1/schools/{schoolId}/students/import-jobs`
- `GET /api/v1/schools/{schoolId}/assessments?branchId=&term=`
- `POST /api/v1/schools/{schoolId}/assessments`
- `POST /api/v1/schools/{schoolId}/reports/terminal/generate`
- `POST /api/v1/schools/{schoolId}/reports/{reportId}/send-whatsapp`
- `POST /api/v1/schools/{schoolId}/reports/{reportId}/send-email`
- `GET /api/v1/schools/{schoolId}/reports/{reportId}/pdf`
- `GET /api/v1/schools/{schoolId}/data-templates`
- `POST /api/v1/schools/{schoolId}/data-upload-jobs`
- `GET /api/v1/schools/{schoolId}/data-upload-jobs/{jobId}`

## Permission baseline
- `proprietor` and `headmaster`: full school + branch control.
- `administrator`: full operations except subscription/billing policy.
- `subject_teacher`: own subject assessments and class results visibility.
- `class_teacher`: class-level reports, parent communication actions.
- `student`: only personal portal access.
