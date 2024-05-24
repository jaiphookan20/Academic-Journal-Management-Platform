create or replace view vw_reviews_overview as
	select 
		review_id, 
		r.submission_id,
		CONCAT(c.first_name, ' ', c.last_name) AS reviewer_name,
		c.email AS reviewer_contact_info,
		-- submission details
		s.submission_title,
		s.abstract AS submission_abstract,
		-- review details
		r.reviewer_id,
		r.confirm_to_editor,
		r.target_date,
		r.review_time,
		o.outcome_name,
		r.revision_review,
		r.review_comments_editor,
		r.review_comments_author
	from reviews r
	inner join clients c on r.reviewer_id = c.client_id
	inner join submissions s on r.submission_id = s.submission_id
	left join outcomes o on r.outcome_recommendation = o.outcome_id
;