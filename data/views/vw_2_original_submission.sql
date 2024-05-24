-- given a submission can have multiple resubmissions, this query helps trace any given submission_id
-- to the original submission_id using recursive query.
create or replace view vw_original_submission as
with recursive submission_path as (
    select 
        submission_id, parent_submission_id, submission_id as original_submission_id
    from submissions
    where parent_submission_id is null

    union all

    select 
        s.submission_id, s.parent_submission_id, sp.original_submission_id
    from submissions s
    inner join submission_path sp on s.parent_submission_id = sp.submission_id
)

select 
    submission_id, original_submission_id, 
    -- get author details
    author_id,
    author.first_name as author_first_name,
    author.last_name as author_last_name,
    -- get editor details
    editor_id,
    editor.first_name as editor_first_name,
    editor.last_name as editor_last_name,
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
from submission_path
inner join submissions using (submission_id)
inner join clients as author on submissions.author_id = author.client_id
left join clients as editor on submissions.editor_id = editor.client_id;

