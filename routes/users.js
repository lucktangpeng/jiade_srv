var express = require('express');
const { progress_mes } = require('../db/config')
var router = express.Router();

const sqlMes = `select dev.dev_no,dev.name,job.prd_name,job.beg_dd,job.end_dd,job.qty,sum(recb.qty_ok) as sum_qty from jm_dev as dev
left join jm_job as job on dev.dev_no=job.rs_no
left join jm_job_rec as rec on rec.jb_no=job.jb_no
left join jm_job_rec_b as recb on recb.opsid=rec.opsid
where job.state='546' and dev.name like '%注塑%'
group by dev.dev_no,dev.name,job.prd_name,job.beg_dd,job.end_dd,job.qty
having sum(isnull(recb.qty_ok,0))>0
order by right(dev.name,len(dev.name)-2)`

const outlist = ['zs01','zs02','zs03', 'zs04','zs05', 'zs06', 'zs07', 'zs08', 'zs09']
/* GET users listing. */
router.get('/', async function(req, res, next) {
  const computed = await progress_mes(sqlMes)
  computed.forEach( val => {
    val.dev_no = val.dev_no.split('-')[1].replace(/ZS/, "zs").replace(/([a-z]+)(0)/, "$1")
  })
  res.json({ data: computed});
});

module.exports = router;
