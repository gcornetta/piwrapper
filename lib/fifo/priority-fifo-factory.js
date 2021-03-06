module.exports.newPriorityFifo = function (maxUsers) {
  var MAXUSERS = maxUsers

  var jobFifo = {}
  jobFifo.logger = require('../../config/winston')
  jobFifo.io = require('../../app').io
  jobFifo.machine = require('../../models/machine')
  jobFifo.Pq = require('@raymond-lam/priority-queue')
  jobFifo.fs = require('fs')

  jobFifo.priorityQueue = new jobFifo.Pq([], (a, b) => {
    if (a.priority > b.priority) return 1
    else if (a.priority < b.priority) return -1
    else return 0
  })
  jobFifo.jobMap = {}
  jobFifo.userMap = {}
  jobFifo.priorityIndex = 1

  jobFifo.push = function (job, callback) {
    if (!this.jobMap[job.jobId]) {
      if (!this.userMap[job.userId]) {
        this.userMap[job.userId] = {
          '_id': job.userId,
          'jobs': []
        }
        this.userMap[job.userId].priority = this.priorityIndex
        job.priority = this.userMap[job.userId].priority
        this.priorityIndex++
        this.priorityQueue.enqueue(this.userMap[job.userId])
      }

      this.userMap[job.userId].jobs.push(job)

      var user = this.priorityQueue.peek(this.priorityQueue.indexOf(this.userMap[job.userId]))
      job = user.jobs[user.jobs.length - 1]
      this.jobMap[job.jobId] = job

      if (this.priorityIndex > (MAXUSERS)) {
        this.resetPriorityIndex()
      }

      this.logger.info('@fifo.push: new job pushed into the FIFO')
      this.logger.info('@fifo.push: job details ' + JSON.stringify(job))
      var that = this
      this.machine.addMachineJob(job, function (err, product, num) {
        if (job.form) {
          job.process = job.form.process
        }
        if (that.userMap[job.userId]) {
          job.priority = that.userMap[job.userId].priority
          // that.io.to('jobUpdates').emit('addJob', JSON.stringify(job));
          callback(err, job)
        } else {
          callback({err: 'Job already removed'}, null) // eslint-disable-line
        }
      })
    } else {
      callback({err: 'Job already exists'}, null) // eslint-disable-line
    }
  }

  jobFifo.update = function (job, callback) {
    if ((job) && (this.jobMap[job.jobId])) {
      job.userId = this.jobMap[job.jobId].userId
      job.status = this.jobMap[job.jobId].status
      job.jobPath = this.jobMap[job.jobId].jobPath
      var that = this
      this.machine.updateJob(job, function (err, product, num) {
        for (var key in that.jobMap[job.jobId]) {
          delete that.jobMap[job.jobId][key]
        }
        for (var key2 in job) {
          that.jobMap[job.jobId][key2] = job[key2]
        }
        that.io.to('jobUpdates').emit('updateJob', JSON.stringify(job))
        that.logger.info('@fifo.update: new job updated into the FIFO')
        that.logger.info('@fifo.update: job details ' + JSON.stringify(job))
        callback(err, that.getJobById(job.jobId))
      })
    } else {
      callback({err: "Job doesn't exist"}, null) // eslint-disable-line
    }
  }

  jobFifo.updatePriority = function (newPriority, userId) {
    if (this.userMap[userId]) {
      this.userMap[userId].priority = newPriority
      this.io.to('jobUpdates').emit('updateUserPriority', userId, newPriority)
      return this.userMap[userId]
    } else {
      return null
    }
  }

  jobFifo.removeJob = function (jobId, callback) {
    if (this.jobMap[jobId]) {
      var that = this
      this.machine.removeJobById(jobId, function (err) {
        var job = JSON.parse(JSON.stringify(that.jobMap[jobId]))
        if (that.userMap[job.userId]) {
          that.userMap[job.userId].jobs.splice(that.userMap[job.userId].jobs.indexOf(that.jobMap[jobId]), 1)
          if (that.userMap[job.userId].jobs.length === 0) {
            delete that.userMap[job.userId]
          }
          delete that.jobMap[jobId]
          that.io.to('jobUpdates').emit('deleteJob', jobId)
          that.logger.info('@fifo.remove: job remove from FIFO')
          that.logger.info('@fifo.remove: job details ' + JSON.stringify(job))
          that.fs.unlink(job.jobPath, function (err) { if (err) { that.logger.error('@fifo.remove file error: ' + err) } })
          if (job.auxFile) {
            that.fs.unlink(job.auxFile, function (err) { if (err) { that.logger.error('@fifo.remove file error: ' + err) } })
          }
          callback(err, job)
        } else {
          callback({err: "Job user doesn't exists"}, null) // eslint-disable-line
        }
      })
    } else {
      callback({err: "Job doesn't exists"}, null) // eslint-disable-line
    }
  }

  jobFifo.getJobById = function (jobId) {
    return this.jobMap[jobId]
  }

  jobFifo.lastJobCompleted = function () {
    var user = this.priorityQueue.dequeue()
    if (user) {
      if (user.jobs.length > 0) {
        var job = user.jobs.shift()
        delete this.jobMap[job.jobId]
        this.io.to('jobUpdates').emit('deleteJob', job.jobId)
        if (user.jobs.length > 0) {
          user.priority = this.priorityIndex
          this.priorityIndex++
          this.priorityQueue.enqueue(user)
        } else {
          delete this.userMap[job.userId]
        }
        return job
      } else {
        delete this.userMap[user._id]
        return this.lastJobCompleted()
      }
    } else {
      return null
    }
  }

  jobFifo.getNextJob = function () {
    var user = this.priorityQueue.dequeue()
    if ((user) && (user.jobs.length > 0)) {
      var job = user.jobs[0]
      job.status = 'running'
      this.updatePriority(-1, user._id)
      this.io.to('jobUpdates').emit('updateJob', JSON.stringify(job))
      this.priorityQueue.enqueue(user)
      return job
    } else {
      return null
    }
  }

  jobFifo.resetPriorityIndex = function () {
    var user = this.priorityQueue.dequeue()
    var minIndex = user.priority
    this.priorityQueue.enqueue(user)
    for (var i in this.userMap) {
      this.userMap[i].priority = this.userMap[i].priority - minIndex
      this.io.to('jobUpdates').emit('updateUserPriority', i, this.userMap[i].priority)
    }
    this.priorityIndex = this.priorityIndex - minIndex
  }

  jobFifo.getJobs = function () {
    var jobs = []
    for (var i in this.jobMap) {
      jobs.push(this.jobMap[i])
    };
    return jobs
  }

  jobFifo.getUsersLength = function () {
    var size = 0
    for (var k in this.userMap) { // eslint-disable-line
      size++
    }
    return size
  }

  jobFifo.getUserJobsLength = function (userId) {
    if (this.userMap[userId]) {
      return this.userMap[userId].jobs.length
    } else {
      return 0
    }
  }

  return jobFifo
}
