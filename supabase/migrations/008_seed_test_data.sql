-- ============================================================================
-- 008_seed_test_data.sql
-- DEV ONLY: Test-Daten für das Dashboard
-- In Produktion: NICHT ausführen. Löscht bestehende Submissions/Tasks nicht.
-- ============================================================================

DO $$
DECLARE
  v_workspace_id uuid;
  v_user_id uuid;
  v_submission_1 uuid;
  v_submission_2 uuid;
  v_submission_3 uuid;
BEGIN
  SELECT w.id, wm.user_id
  INTO v_workspace_id, v_user_id
  FROM workspaces w
  JOIN workspace_members wm ON wm.workspace_id = w.id
  WHERE wm.role = 'doctor'
  ORDER BY w.created_at ASC
  LIMIT 1;

  IF v_workspace_id IS NULL THEN
    RAISE NOTICE 'Kein Workspace mit Doctor gefunden. Bitte erst registrieren.';
  ELSE
    INSERT INTO submissions (workspace_id, patient_name, patient_email, created_at)
    VALUES
      (v_workspace_id, 'Anna M.', 'anna@example.com', now() - interval '2 hours')
    RETURNING id INTO v_submission_1;

    INSERT INTO submissions (workspace_id, patient_name, patient_email, created_at)
    VALUES
      (v_workspace_id, 'Jakob K.', 'jakob@example.com', now() - interval '5 hours')
    RETURNING id INTO v_submission_2;

    INSERT INTO submissions (workspace_id, patient_name, patient_email, created_at)
    VALUES
      (v_workspace_id, 'Marie L.', 'marie@example.com', now() - interval '1 day')
    RETURNING id INTO v_submission_3;

    INSERT INTO tasks (workspace_id, submission_id, content, recipient_type, created_by)
    VALUES
      (v_workspace_id, v_submission_1, 'Patient zum Kontrolltermin einladen', 'doctor_only', v_user_id),
      (v_workspace_id, v_submission_1, 'Röntgen-Aufnahme vom letzten Besuch raussuchen', 'all_team', v_user_id);

    INSERT INTO tasks (workspace_id, submission_id, content, recipient_type, created_by)
    VALUES
      (v_workspace_id, v_submission_2, 'Terminlink senden — Patient bevorzugt Vormittage', 'all_team', v_user_id);

    RAISE NOTICE 'Test-Daten eingefügt für Workspace %', v_workspace_id;
  END IF;
END $$;
