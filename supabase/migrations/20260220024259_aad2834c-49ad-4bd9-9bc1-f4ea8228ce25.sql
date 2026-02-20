-- Allow parent affiliates to update their sub-affiliates' sub_commission_rate
CREATE POLICY "Parents can update their sub-affiliates"
  ON public.affiliates FOR UPDATE
  USING (parent_affiliate_id = get_my_affiliate_id())
  WITH CHECK (parent_affiliate_id = get_my_affiliate_id());
