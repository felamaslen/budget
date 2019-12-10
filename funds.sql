select
  fund_units.month
  ,sum(fund_units.sum_units * fc.price) as value
from (
  select *
  from (
    select
      dates.cid
      ,dates.month
      ,f.id
      ,f.item
      ,transactions.sum_units
      -- ,transactions.sum_cost
      ,row_number() over (
        partition by dates.month, f.id
        order by transactions.month desc
      ) as row_number
    from (
      select
        s.cid
        ,(s.month + interval '1 month' - interval '1 day')::date as month
      from (
        select
          r.*
          ,row_number() over (partition by r.month order by r.time desc) as row_num
        from (
          select
            cid
            ,time
            ,date_trunc('month', time)::date as month
          from fund_cache_time fct
          where fct.done
        ) r
      ) s
      where s.row_num = 1
    ) dates
    cross join funds f

    inner join (
      select
        fund_id
        ,month
        ,sum_units
        -- ,sum_cost
      from (
        select
          fund_id
          ,"date"
          ,month
          ,units
          ,sum(units) over (
            partition by fund_id
            order by "date" asc
            rows between unbounded preceding and current row
          ) as sum_units
          -- ,cost
          -- ,sum(cost) over (
          --   partition by fund_id
          --   order by "date" asc
          --   rows between unbounded preceding and current row
          -- ) as sum_cost
          ,row_number() over (
            partition by fund_id, month
            order by "date" desc
          ) as row_num
        from (
          select
            fund_id
            ,"date"
            ,units
            ,cost
            ,date_trunc('month', "date")::date as month
          from funds_transactions ft
        ) r
      ) s
      where s.row_num = 1
    ) transactions
    on transactions.fund_id = f.id
      and transactions.month <= dates.month

    inner join users u on u.uid = f.uid
    where u.name = 'fela'

  ) t
  where t.row_number = 1
) fund_units
inner join funds on funds.id = fund_units.id
inner join fund_hash fh on fh.hash = md5(funds.item || 'a963anx2')
inner join fund_cache fc on fc.fid = fh.fid and fc.cid = fund_units.cid
group by fund_units.month
order by fund_units.month
;

