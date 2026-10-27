-- ==========================================================
-- INTERNFLOW V5: FIX DOCUMENT STORAGE PATHS AND RESUME URLS
-- ==========================================================

-- 1. Ensure students with legacy /uploads/ paths point to authenticated /api/documents/{id}/download
UPDATE students
SET resume_url = (
    SELECT CONCAT('/api/documents/', id, '/download')
    FROM documents
    WHERE documents.student_id = students.id AND documents.document_type = 'RESUME'
    ORDER BY id DESC
    LIMIT 1
)
WHERE resume_url LIKE '/uploads/%'
  AND EXISTS (SELECT 1 FROM documents WHERE documents.student_id = students.id AND documents.document_type = 'RESUME');

-- 2. For student 1 (Alex Rivera), ensure resume_url is set to /api/documents/1/download if still /uploads/ or NULL
UPDATE students
SET resume_url = '/api/documents/1/download'
WHERE id = 1 AND (resume_url LIKE '/uploads/%' OR resume_url IS NULL);

-- 3. If student 2 (Emily Watson) doesn't have a RESUME document in documents table, insert one
INSERT INTO documents (id, student_id, application_id, document_type, file_name, file_path, file_size, mime_type, verification_status, rejection_reason, verified_by_admin_id, uploaded_at, verified_at)
SELECT 3, 2, NULL, 'RESUME', 'Emily_Watson_Resume.pdf', 'uploads/resume/emily_watson_resume.pdf', 215040, 'application/pdf', 'VERIFIED', NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM documents WHERE id = 3 OR (student_id = 2 AND document_type = 'RESUME'));

-- 4. Update student 2's resume_url
UPDATE students
SET resume_url = '/api/documents/3/download'
WHERE id = 2 AND (resume_url LIKE '/uploads/%' OR resume_url IS NULL);

-- 5. Normalize any document file paths starting with leading slash or /uploads/ to relative uploads/ paths
UPDATE documents
SET file_path = 'uploads/resume/alex_rivera_resume.pdf'
WHERE id = 1 AND file_path = '/uploads/resumes/alex_rivera_resume.pdf';

UPDATE documents
SET file_path = 'uploads/offers/msft_offer_emily.pdf'
WHERE id = 2 AND file_path = '/uploads/offers/msft_offer_emily.pdf';
