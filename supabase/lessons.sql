-- Financial Literacy Content Module
--
-- Lessons table: public reference data for financial literacy content.
-- user_lesson_progress table: tracks which lessons each user has seen.
--
-- Run this in the Supabase SQL Editor after weekly_summary.sql (which enables RLS).

-- ---------------------------------------------------------------------------
-- lessons table (public reference data, no RLS needed)
-- ---------------------------------------------------------------------------

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_condition VARCHAR(50) NOT NULL UNIQUE,
  content_en TEXT NOT NULL,
  content_np TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_lessons_trigger_condition ON lessons(trigger_condition);

-- ---------------------------------------------------------------------------
-- user_lesson_progress table (tracks which lessons user has seen)
-- ---------------------------------------------------------------------------

CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  seen_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);

-- ---------------------------------------------------------------------------
-- Row Level Security for user_lesson_progress
-- ---------------------------------------------------------------------------

ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own lesson progress" ON user_lesson_progress;
CREATE POLICY "Users can view own lesson progress" ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own lesson progress" ON user_lesson_progress;
CREATE POLICY "Users can insert own lesson progress" ON user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own lesson progress" ON user_lesson_progress;
CREATE POLICY "Users can update own lesson progress" ON user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own lesson progress" ON user_lesson_progress;
CREATE POLICY "Users can delete own lesson progress" ON user_lesson_progress
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Seed lessons
-- ---------------------------------------------------------------------------

INSERT INTO lessons (trigger_condition, content_en, content_np) VALUES
  (
    'third_save',
    'You are building momentum! 🎯

By saving for your 3rd transaction, you are forming a powerful habit. Consistent saving, even in small amounts, adds up over time and gives you peace of mind.

Tip: Try to save something from every transaction, even if it is just 5-10%. Small steps lead to big changes.',
    'तपाई गति बनाइरहनुभएको छ! 🎯

तपाईको तीनौ लेनदेनमा बचत गरेर, तपाई एक शक्तिशाली आदत बनाइरहनुभएको छ। सुसंगत बचत, साना रकमहरूमा पनि, समयको साथ जमा हुन्छ र तपाईलाई मन शान्ति दिन्छ।

सुझाव: हरेक लेनदेनमा केही बचत गर्न प्रयास गर्नुहोस्, यदि यो 5-10% जति छ भने। साना कदमहरू ठूला परिवर्तनहरूमा जान्छन्।'
  ),
  (
    'missed_streak',
    'Taking a break? No worries! 🔄

Every restart is a fresh chance. Whether you have been busy or going through a tough time, we are here to support you. When you are ready, share your next update—even a small transaction matters.

Remember: Progress is not always linear. What matters is getting back on track.',
    'विश्राम लिइरहनुभएको छ? चिन्ता गर्नु छैन! 🔄

हरेक पुनरारम्भ एक नयाँ मौका हो। चाहे तपाई व्यस्त रहनुभएको हो वा कठिन समय गएको हो, हामी तपाईलाई समर्थन गर्न यहाँ छौं। जब तपाई तयार हुनुहुन्छ, तपाईको अगलो अपडेट साझा गर्नुहोस्—साना लेनदेन पनि महत्त्वपूर्ण छ।

याद राख्नुहोस्: प्रगति सधैं सीधा हुँदैन। जो महत्त्वपूर्ण छ त पटरीमा फिर्ता आउनु हो।'
  ),
  (
    'first_goal',
    'Your first goal is set! 🚀

Having a clear savings goal transforms how you think about money. You are no longer just saving—you are saving toward something meaningful. This gives your savings purpose and direction.

Keep tracking your progress and celebrate small wins along the way!',
    'तपाईको पहिलो लक्ष्य सेट गरिएको छ! 🚀

स्पष्ट बचत लक्ष्य राखेर तपाई पैसाको बारेमा सोच्ने तरिका परिवर्तन गर्नुहुन्छ। तपाई अब बचत मात्र गरिरहनुभएको छैनन्—तपाई केही अर्थपूर्ण कुरामा बचत गरिरहनुभएको छ। यसले तपाईको बचतलाई उद्देश्य र दिशा दिन्छ।

तपाईको प्रगति ट्र्याक गरिरहनुहोस् र बाटोमा साना जितहरू मनाउनुहोस्।'
  ),
  (
    'consistency_boost',
    'You are on fire! 🔥 5 transactions in a row—all saved!

Consistency is the real superpower of wealth building. By saving from 5 consecutive transactions, you have proven that this is not a one-time thing—this is your new normal.

Keep the momentum going. You are on your way to financial freedom!',
    'तपाई आगोमा छ! 🔥 पाँच लेनदेन एक पछि अर्को—सबै बचत!

सुसंगतता धन निर्माणको वास्तविक शक्ति हो। पाँच लगातार लेनदेनमा बचत गरेर, तपाईले यो एक समय मात्र हो भनी प्रमाण गरिसकनुभएको छ—यो तपाईको नयाँ सामान्य हो।

गति जारी राख्नुहोस्। तपाई आर्थिक स्वतन्त्रतामा जाँदै हुनुभएको छ।'
  );
