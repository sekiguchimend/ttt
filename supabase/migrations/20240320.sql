-- 各テーブルの前に条件付き作成チェックを行う

-- 管理者ユーザーテーブル
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 管理者ユーザーのポリシー (IF NOT EXISTS付き)
DROP POLICY IF EXISTS "全ユーザーが管理者ユーザーを参照可能" ON public.admin_users;
CREATE POLICY "全ユーザーが管理者ユーザーを参照可能" ON public.admin_users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "管理者のみ管理者ユーザーを作成可能" ON public.admin_users;
CREATE POLICY "管理者のみ管理者ユーザーを作成可能" ON public.admin_users
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

DROP POLICY IF EXISTS "管理者のみ管理者ユーザーを更新可能" ON public.admin_users;
CREATE POLICY "管理者のみ管理者ユーザーを更新可能" ON public.admin_users
    FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

DROP POLICY IF EXISTS "管理者のみ管理者ユーザーを削除可能" ON public.admin_users;
CREATE POLICY "管理者のみ管理者ユーザーを削除可能" ON public.admin_users
    FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 従業員テーブル
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    position TEXT NOT NULL,
    department TEXT NOT NULL,
    hire_date DATE NOT NULL,
    salary INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- 従業員のポリシー
DROP POLICY IF EXISTS "全ユーザーが従業員情報を参照可能" ON public.employees;
CREATE POLICY "全ユーザーが従業員情報を参照可能" ON public.employees
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "管理者のみ従業員情報を作成可能" ON public.employees;
CREATE POLICY "管理者のみ従業員情報を作成可能" ON public.employees
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

DROP POLICY IF EXISTS "管理者のみ従業員情報を更新可能" ON public.employees;
CREATE POLICY "管理者のみ従業員情報を更新可能" ON public.employees
    FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

DROP POLICY IF EXISTS "管理者のみ従業員情報を削除可能" ON public.employees;
CREATE POLICY "管理者のみ従業員情報を削除可能" ON public.employees
    FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 従業員給与テーブル
CREATE TABLE IF NOT EXISTS public.employee_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    base_salary INTEGER NOT NULL DEFAULT 0,
    overtime_pay INTEGER NOT NULL DEFAULT 0,
    bonus INTEGER NOT NULL DEFAULT 0,
    deductions INTEGER NOT NULL DEFAULT 0,
    net_salary INTEGER NOT NULL DEFAULT 0,
    payment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE public.employee_payments ENABLE ROW LEVEL SECURITY;

-- 従業員給与のポリシー
DROP POLICY IF EXISTS "全ユーザーが従業員給与を参照可能" ON public.employee_payments;
CREATE POLICY "全ユーザーが従業員給与を参照可能" ON public.employee_payments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "管理者のみ従業員給与を作成可能" ON public.employee_payments;
CREATE POLICY "管理者のみ従業員給与を作成可能" ON public.employee_payments
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

DROP POLICY IF EXISTS "管理者のみ従業員給与を更新可能" ON public.employee_payments;
CREATE POLICY "管理者のみ従業員給与を更新可能" ON public.employee_payments
    FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

DROP POLICY IF EXISTS "管理者のみ従業員給与を削除可能" ON public.employee_payments;
CREATE POLICY "管理者のみ従業員給与を削除可能" ON public.employee_payments
    FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 固定費カテゴリーテーブル
CREATE TABLE IF NOT EXISTS public.fixed_cost_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE public.fixed_cost_categories ENABLE ROW LEVEL SECURITY;

-- 固定費カテゴリーのポリシー
DROP POLICY IF EXISTS "全ユーザーが固定費カテゴリーを参照可能" ON public.fixed_cost_categories;
CREATE POLICY "全ユーザーが固定費カテゴリーを参照可能" ON public.fixed_cost_categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "管理者のみ固定費カテゴリーを作成可能" ON public.fixed_cost_categories;
CREATE POLICY "管理者のみ固定費カテゴリーを作成可能" ON public.fixed_cost_categories
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

DROP POLICY IF EXISTS "管理者のみ固定費カテゴリーを更新可能" ON public.fixed_cost_categories;
CREATE POLICY "管理者のみ固定費カテゴリーを更新可能" ON public.fixed_cost_categories
    FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

DROP POLICY IF EXISTS "管理者のみ固定費カテゴリーを削除可能" ON public.fixed_cost_categories;
CREATE POLICY "管理者のみ固定費カテゴリーを削除可能" ON public.fixed_cost_categories
    FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 固定費テーブル
CREATE TABLE IF NOT EXISTS public.fixed_costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES public.fixed_cost_categories(id),
    name TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    payment_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;

-- 固定費のポリシー
DROP POLICY IF EXISTS "全ユーザーが固定費を参照可能" ON public.fixed_costs;
CREATE POLICY "全ユーザーが固定費を参照可能" ON public.fixed_costs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "管理者のみ固定費を作成可能" ON public.fixed_costs;
CREATE POLICY "管理者のみ固定費を作成可能" ON public.fixed_costs
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

DROP POLICY IF EXISTS "管理者のみ固定費を更新可能" ON public.fixed_costs;
CREATE POLICY "管理者のみ固定費を更新可能" ON public.fixed_costs
    FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

DROP POLICY IF EXISTS "管理者のみ固定費を削除可能" ON public.fixed_costs;
CREATE POLICY "管理者のみ固定費を削除可能" ON public.fixed_costs
    FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- KPI指標テーブル
CREATE TABLE IF NOT EXISTS public.kpi_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    minimum_target INTEGER NOT NULL DEFAULT 0,
    standard_target INTEGER NOT NULL DEFAULT 0,
    stretch_target INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT '件',
    date DATE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE public.kpi_metrics ENABLE ROW LEVEL SECURITY;

-- KPI指標のポリシー
DROP POLICY IF EXISTS "ユーザーは自分のKPI指標のみ参照可能" ON public.kpi_metrics;
CREATE POLICY "ユーザーは自分のKPI指標のみ参照可能" ON public.kpi_metrics
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分のKPI指標のみ作成可能" ON public.kpi_metrics;
CREATE POLICY "ユーザーは自分のKPI指標のみ作成可能" ON public.kpi_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分のKPI指標のみ更新可能" ON public.kpi_metrics;
CREATE POLICY "ユーザーは自分のKPI指標のみ更新可能" ON public.kpi_metrics
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分のKPI指標のみ削除可能" ON public.kpi_metrics;
CREATE POLICY "ユーザーは自分のKPI指標のみ削除可能" ON public.kpi_metrics
    FOR DELETE USING (auth.uid() = user_id);

-- KPI目標テーブル
CREATE TABLE IF NOT EXISTS public.kpi_targets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_id UUID NOT NULL REFERENCES public.kpi_metrics(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE public.kpi_targets ENABLE ROW LEVEL SECURITY;

-- KPI目標のポリシー
DROP POLICY IF EXISTS "ユーザーは関連するKPI指標の目標のみ参照可能" ON public.kpi_targets;
CREATE POLICY "ユーザーは関連するKPI指標の目標のみ参照可能" ON public.kpi_targets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.kpi_metrics
            WHERE kpi_metrics.id = kpi_targets.metric_id
            AND kpi_metrics.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "ユーザーは関連するKPI指標の目標のみ作成可能" ON public.kpi_targets;
CREATE POLICY "ユーザーは関連するKPI指標の目標のみ作成可能" ON public.kpi_targets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.kpi_metrics
            WHERE kpi_metrics.id = kpi_targets.metric_id
            AND kpi_metrics.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "ユーザーは関連するKPI指標の目標のみ更新可能" ON public.kpi_targets;
CREATE POLICY "ユーザーは関連するKPI指標の目標のみ更新可能" ON public.kpi_targets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.kpi_metrics
            WHERE kpi_metrics.id = kpi_targets.metric_id
            AND kpi_metrics.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "ユーザーは関連するKPI指標の目標のみ削除可能" ON public.kpi_targets;
CREATE POLICY "ユーザーは関連するKPI指標の目標のみ削除可能" ON public.kpi_targets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.kpi_metrics
            WHERE kpi_metrics.id = kpi_targets.metric_id
            AND kpi_metrics.user_id = auth.uid()
        )
    );

-- KPI実績テーブル
CREATE TABLE IF NOT EXISTS public.kpi_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    target_id UUID NOT NULL REFERENCES public.kpi_targets(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE public.kpi_achievements ENABLE ROW LEVEL SECURITY;

-- KPI実績のポリシー
DROP POLICY IF EXISTS "ユーザーは関連するKPI目標の実績のみ参照可能" ON public.kpi_achievements;
CREATE POLICY "ユーザーは関連するKPI目標の実績のみ参照可能" ON public.kpi_achievements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.kpi_targets
            JOIN public.kpi_metrics ON kpi_metrics.id = kpi_targets.metric_id
            WHERE kpi_targets.id = kpi_achievements.target_id
            AND kpi_metrics.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "ユーザーは関連するKPI目標の実績のみ作成可能" ON public.kpi_achievements;
CREATE POLICY "ユーザーは関連するKPI目標の実績のみ作成可能" ON public.kpi_achievements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.kpi_targets
            JOIN public.kpi_metrics ON kpi_metrics.id = kpi_targets.metric_id
            WHERE kpi_targets.id = kpi_achievements.target_id
            AND kpi_metrics.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "ユーザーは関連するKPI目標の実績のみ更新可能" ON public.kpi_achievements;
CREATE POLICY "ユーザーは関連するKPI目標の実績のみ更新可能" ON public.kpi_achievements
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.kpi_targets
            JOIN public.kpi_metrics ON kpi_metrics.id = kpi_targets.metric_id
            WHERE kpi_targets.id = kpi_achievements.target_id
            AND kpi_metrics.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "ユーザーは関連するKPI目標の実績のみ削除可能" ON public.kpi_achievements;
CREATE POLICY "ユーザーは関連するKPI目標の実績のみ削除可能" ON public.kpi_achievements
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.kpi_targets
            JOIN public.kpi_metrics ON kpi_metrics.id = kpi_targets.metric_id
            WHERE kpi_targets.id = kpi_achievements.target_id
            AND kpi_metrics.user_id = auth.uid()
        )
    );

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ユーザーのポリシー
DROP POLICY IF EXISTS "ユーザーは自分の情報のみ参照可能" ON public.users;
DROP POLICY IF EXISTS "ユーザーは自分の情報のみ更新可能" ON public.users;
DROP POLICY IF EXISTS "新規ユーザーの作成を許可" ON public.users;
DROP POLICY IF EXISTS "ユーザーは自分の情報のみ削除可能" ON public.users;

-- SELECT - ユーザーは自分の情報のみ参照可能
CREATE POLICY "ユーザーは自分の情報のみ参照可能" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- INSERT - 新規ユーザーの作成を許可（auth.uidと一致する場合のみ）
CREATE POLICY "新規ユーザーの作成を許可" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE - ユーザーは自分の情報のみ更新可能
CREATE POLICY "ユーザーは自分の情報のみ更新可能" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- DELETE - ユーザーは自分の情報のみ削除可能
CREATE POLICY "ユーザーは自分の情報のみ削除可能" ON public.users
    FOR DELETE USING (auth.uid() = id);

-- トリガー関数の作成（よりシンプルな構文）
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS 
E'
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
';

-- トリガーの作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- updated_atを自動更新するトリガー
DROP TRIGGER IF EXISTS handle_candidates_updated_at ON public.candidates;
CREATE TRIGGER handle_candidates_updated_at
    BEFORE UPDATE ON public.candidates
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Supabaseのスキーマキャッシュ更新用コメント
COMMENT ON TABLE public.candidates IS 'Stores candidate data with status field';
COMMENT ON COLUMN public.candidates.status IS 'Candidate status (応募, etc)';

-- キャッシュのリロード
SELECT pg_notify('pgrst', 'reload schema');更新するトリガー関数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トランザクションテーブルを再作成（問題を解決するため）
DROP TABLE IF EXISTS public.transactions CASCADE;

-- 取引テーブル
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT '商談中',
    date DATE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 取引のポリシー
DROP POLICY IF EXISTS "ユーザーは自分の取引のみ参照可能" ON public.transactions;
CREATE POLICY "ユーザーは自分の取引のみ参照可能" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分の取引のみ作成可能" ON public.transactions;
CREATE POLICY "ユーザーは自分の取引のみ作成可能" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分の取引のみ更新可能" ON public.transactions;
CREATE POLICY "ユーザーは自分の取引のみ更新可能" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分の取引のみ削除可能" ON public.transactions;
CREATE POLICY "ユーザーは自分の取引のみ削除可能" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- transactionsテーブルのupdated_atを自動更新するトリガー
DROP TRIGGER IF EXISTS handle_transactions_updated_at ON public.transactions;
CREATE TRIGGER handle_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Supabaseのスキーマキャッシュ更新用コメント
COMMENT ON TABLE public.transactions IS 'Stores transaction data with status field';
COMMENT ON COLUMN public.transactions.status IS 'Transaction status (商談中, etc)';

-- キャッシュ問題が再発する場合に備えて、以下も試してください
SELECT pg_notify('pgrst', 'reload schema');

-- KPI日別実績テーブル
CREATE TABLE IF NOT EXISTS public.daily_kpi_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kpi_id UUID NOT NULL REFERENCES public.kpi_metrics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    actual_value NUMERIC NOT NULL DEFAULT 0,
    is_achieved BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- kpi_idとdateの組み合わせで一意に制約
    UNIQUE(kpi_id, date)
);

-- RLSポリシーの設定
ALTER TABLE public.daily_kpi_achievements ENABLE ROW LEVEL SECURITY;

-- KPI日別実績のポリシー
DROP POLICY IF EXISTS "ユーザーは自分のKPI日別実績のみ参照可能" ON public.daily_kpi_achievements;
CREATE POLICY "ユーザーは自分のKPI日別実績のみ参照可能" ON public.daily_kpi_achievements
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分のKPI日別実績のみ作成可能" ON public.daily_kpi_achievements;
CREATE POLICY "ユーザーは自分のKPI日別実績のみ作成可能" ON public.daily_kpi_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分のKPI日別実績のみ更新可能" ON public.daily_kpi_achievements;
CREATE POLICY "ユーザーは自分のKPI日別実績のみ更新可能" ON public.daily_kpi_achievements
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分のKPI日別実績のみ削除可能" ON public.daily_kpi_achievements;
CREATE POLICY "ユーザーは自分のKPI日別実績のみ削除可能" ON public.daily_kpi_achievements
    FOR DELETE USING (auth.uid() = user_id);

-- daily_kpi_achievementsテーブルのupdated_atを自動更新するトリガー
DROP TRIGGER IF EXISTS handle_daily_kpi_achievements_updated_at ON public.daily_kpi_achievements;
CREATE TRIGGER handle_daily_kpi_achievements_updated_at
    BEFORE UPDATE ON public.daily_kpi_achievements
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 営業実績テーブル
CREATE TABLE IF NOT EXISTS public.sales_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    sales_amount INTEGER NOT NULL DEFAULT 0,
    new_customers INTEGER NOT NULL DEFAULT 0,
    existing_customers INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, date)
);

-- RLSポリシーの設定
ALTER TABLE public.sales_achievements ENABLE ROW LEVEL SECURITY;

-- 営業実績のポリシー
DROP POLICY IF EXISTS "ユーザーは自分の営業実績のみ参照可能" ON public.sales_achievements;
CREATE POLICY "ユーザーは自分の営業実績のみ参照可能" ON public.sales_achievements
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分の営業実績のみ作成可能" ON public.sales_achievements;
CREATE POLICY "ユーザーは自分の営業実績のみ作成可能" ON public.sales_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分の営業実績のみ更新可能" ON public.sales_achievements;
CREATE POLICY "ユーザーは自分の営業実績のみ更新可能" ON public.sales_achievements
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分の営業実績のみ削除可能" ON public.sales_achievements;
CREATE POLICY "ユーザーは自分の営業実績のみ削除可能" ON public.sales_achievements
    FOR DELETE USING (auth.uid() = user_id);

-- sales_achievementsテーブルのupdated_atを自動更新するトリガー
DROP TRIGGER IF EXISTS handle_sales_achievements_updated_at ON public.sales_achievements;
CREATE TRIGGER handle_sales_achievements_updated_at
    BEFORE UPDATE ON public.sales_achievements
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 候補者テーブルの作成
DROP TABLE IF EXISTS public.candidates CASCADE;
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    position TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT '応募',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- 候補者のポリシー
DROP POLICY IF EXISTS "管理者は全ての候補者を参照可能" ON public.candidates;
CREATE POLICY "管理者は全ての候補者を参照可能" ON public.candidates
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

DROP POLICY IF EXISTS "管理者は候補者を追加可能" ON public.candidates;
CREATE POLICY "管理者は候補者を追加可能" ON public.candidates
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

DROP POLICY IF EXISTS "管理者は候補者を更新可能" ON public.candidates;
CREATE POLICY "管理者は候補者を更新可能" ON public.candidates
    FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

DROP POLICY IF EXISTS "管理者は候補者を削除可能" ON public.candidates;
CREATE POLICY "管理者は候補者を削除可能" ON public.candidates
    FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- updated_atを自動