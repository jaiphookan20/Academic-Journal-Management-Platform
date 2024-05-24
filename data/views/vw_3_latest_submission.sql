create or replace view vw_latest_submission as

-- given a submission can have multiple resubmissions, this query helps trace any given submission_id
-- to the latest submission_id of a submission chain.
select
    submission_id, original_submission_id, 
    (SELECT submission_id FROM vw_original_submission WHERE original_submission_id = sp.original_submission_id ORDER BY submission_id DESC LIMIT 1) AS latest_submission_id,
    -- get author details
    author_id,
    author_first_name,
    author_last_name,
    -- get editor details
    editor_id,
    editor_first_name,
    editor_last_name,
    -- submission details
    submission_title,
    submission_time,
    submission_type,
    status,
    abstract,
    acknowledgements,
    conflict_of_interest,
    authors,
    outcome_id
FROM 
    vw_original_submission sp;