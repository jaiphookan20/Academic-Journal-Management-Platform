-- given a submission id, figure out all the inline comments for it
create or replace view vw_submission_inline_comment as
select
    -- get submission detail
    submissions.submission_id,
    -- get file details
    files.file_id,
    files.file_name,
    -- get inline comments details
    manuscript_comments.comment_id,
    manuscript_comments.comments,
    manuscript_comments.visible_to_author,
    -- get commentor's details
    clients.client_id,
    clients.first_name,
    clients.last_name
from submissions
inner join files on submissions.submission_id = files.submission_id
inner join manuscript_comments on files.file_id = manuscript_comments.file_id
inner join clients on manuscript_comments.commented_by = clients.client_id;

