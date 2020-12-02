var express = require('express');
var router = express.Router();

// 所有设备的综合计算属性
const sqlContent = 'select  B.* from (SELECT max(Time) as maxtime,Device_Name FROM [OEE].[dbo].[OEE] group by Device_Name)A ,[OEE].[dbo].[OEE] B where A.Device_Name=B.Device_Name AND A.maxtime=B.Time'
// 注塑机的额外属性
const sqlContentDetail = `select　B.* FROM 
(select max(Time) as Time ,Device_Name from [OEE].[dbo].[para] GROUP BY Device_Name)A,[OEE].[dbo].[para] B
where A.Time=B.Time and A.Device_Name=B.Device_Name `

// 所有设备的状态  257 台
const sqlStatus = `select B.* from 
(SELECT Device_Name,max(Time) as Time from [OEE].[dbo].[state] group by Device_Name)A,[OEE].[dbo].[state] B
 where A.Time=B.Time and A.Device_Name=B.Device_Name`
// 跨库搜索 注塑机 冲床 压针编带 压针  工单上线数据
const sqlNewMes = `select dev.dev_no,dev.name,job.prd_name,job.beg_dd,job.end_dd,job.qty,sum(recb.qty_ok) as sum_qty from Y8_MES15..jm_dev as dev
left join Y8_MES15..jm_job as job on dev.dev_no=job.rs_no
left join Y8_MES15..jm_job_rec as rec on rec.jb_no=job.jb_no
left join Y8_MES15..jm_job_rec_b as recb on recb.opsid=rec.opsid
where job.state='546'
group by dev.dev_no,dev.name,job.prd_name,job.beg_dd,job.end_dd,job.qty
having sum(isnull(recb.qty_ok,0))>0
order by right(dev.name,len(dev.name)-2)`
 


const { progress } = require('../db/config')
/* GET home page. */
router.get('/', async function(req, res, next) {

  const edit = await progress(sqlContentDetail)
  const computed = await progress(sqlContent)
  const status = await progress(sqlStatus)
  const Mes = await progress(sqlNewMes)
  Mes.forEach( val => {
    val.dev_no = val.dev_no.split('-')[1].replace(/([A-Z]+)/, (ary) => {
      return ary.toLowerCase()
    })
  })
  const editList = ['zs1', 'zs2', 'zs3', 'zs4', 'zs5', 'zs6', 'zs7', 'zs8', 'zs9']
  edit.forEach( val => {
    val.Device_Name = val.Device_Name.trim()
    if (editList.indexOf(val.Device_Name) !== -1) {
      val.Device_Name = val.Device_Name.replace(/([a-z]+)(\d)/, '$10$2')
    }
  })
  computed.forEach( value => {
    status.forEach( item => {
      if (value.Device_Name === item.Device_Name) {
        for (let i in item) {
          if (i !== 'Device_Name') {
            value[i] = item[i]
          }
        }
      }
    })
    value.Device_Name = value.Device_Name.trim().replace(/([A-Z]+)/, (ary) => {
      return ary.toLowerCase()
    })
    Mes.forEach( me => {
      if (value.Device_Name === me.dev_no) {
        for (let i in me) {
          if (i !== 'dev_no') {
            value[i] = me[i]
          }
        }
      }
    })
    edit.forEach( ed => {
      if (value.Device_Name === ed.Device_Name) {
        for (let i in ed) {
          if (i !== 'Device_Name') {
            value[i] = ed[i]
          }
        }
      }
    })
  })
  res.json({ data: computed, data2: edit})
});

module.exports = router;
