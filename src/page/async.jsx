import React, { useState, useEffect } from 'react';
import { Button, DatePicker, Pagination, Dropdown, DropdownItem } from '@ellucian/react-design-system/core';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { Icon } from '@ellucian/ds-icons/lib';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import axios from 'axios';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const styles = () => ({
  root: {
    maxWidth: '95%',
    margin: '2rem auto',
    padding: '0 20px',
    fontFamily: 'Arial',
  },
  heading: {
    maxWidth: '95%',
    margin: '0 auto',
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  filterSection: {
    background: '#F8F9FA',
    padding: '20px',
    borderRadius: 8,
    marginBottom: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    
    maxWidth: '95%',
    margin: '0 auto',
  },
  filterRow: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    
    justifyContent: 'space-between',
  },
  dropdown: {
    minWidth: '250px',
  },
  tableSection: {
    maxWidth: '95%',
    margin: '0 auto',
    overflowX: 'auto', 
  },
  table: {
    width: '100%',
    borderCollapse: 'separate', 
    borderSpacing: '0 8px', 
    tableLayout: 'fixed',
    minWidth: '1200px', 
  },
  tableCell: {
    padding: '16px 24px', 
    borderBottom: '1px solid #eee',
    backgroundColor: 'white',
    textAlign: 'left',
    fontSize: '18px', 
    fontWeight: '400', 
  },
  statusCell: {
    padding: '16px 24px', 
    borderBottom: '1px solid #eee',
    backgroundColor: 'white',
    position: 'relative',
    
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '16px',
    fontWeight: '500',
    fontSize: '15px',
    display: 'inline-block',
    textAlign: 'center',
    minWidth: '100px',
    marginLeft: '15px',
    
  },
  completed: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
    border: '1px solid #1976D2',
  },
  inProgress: {
    backgroundColor: '#FFF3E0',
    color: '#F57C00',
    border: '1px solid #F57C00',
  },
  failed: {
    backgroundColor: '#FFEBEE',
    color: '#D32F2F',
    border: '1px solid #D32F2F',
  },
  pending: {
    backgroundColor: '#F5F5F5',
    color: '#757575',
    border: '1px solid #757575',
  },
  tableHeader: {
    backgroundColor: '#90CAF9',
    color:'rgb(21, 28, 37)',
    bold: 'bold',
    padding: '13px 26px',
    textAlign: 'center',
    fontWeight: '500',
    borderBottom: '2px solid #64B5F6',
    
    borderRight: '1px solid #64B5F6',
    textTransform: 'uppercase', 
    letterSpacing: '0.5px',
    '&:last-child': {
      borderRight: 'none',
    },
    position: 'relative', 
    '&::after': { 
      content: '""',
      position: 'absolute',
      right: 0,
      top: '10%',
      height: '80%',
      width: '2px',
      backgroundColor: 'white'
    },
    '&:last-child::after': {
      display: 'none' 
    }
  },
  downloadButton: {
    color: 'white',
    '&:hover': {
      color: 'white'
    }
  },
  downloadContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  errorMessage: {
    color: '#d32f2f',
    fontSize: '0.8rem',
    maxWidth: '200px',
    wordBreak: 'break-word'
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '1rem',
    gap: '1rem'
  },
  rowsPerPageSelect: {
    minWidth: '100px',
    marginLeft: '0.5rem'
  },
  loadingState: {
    textAlign: 'center',
    padding: '2rem',
  },
  errorState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#d32f2f',
  },
  jobNameColumn: {
    width: '9%', 
  },
  executionTimeColumn: {
    width: '18%',
  },
  statusColumn: {
    width: '11%',
  },
  jobIdColumn: {
    width: '27%', 
    minWidth: '250px', 
  },
  executedByColumn: {
    width: '22%',
  },
  downloadColumn: {
    width: '12%',
  },
  alertMessage: {
    color: '#f44336',
    fontSize: '0.875rem',
    marginTop: '8px',
    textAlign: 'left'
  }
});

const DownloadButton = ({ classes, report }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const awsConfig = {
    region: 'eu-west-1',
    credentials: {
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey:process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
      sessionToken:process.env.REACT_APP_AWS_SESSION_TOKEN
    }
  };

  const buttonStyles = classNames(
    'buttonRoot',
    'iconSpin',
    classes.downloadButton
  );

  const generateS3Key = (report) => {
    return `tenant_data/${report.tenantId}/notification/${report.jobName}/${report.fileName}`;
  };

  useEffect(() => {
    setError(null);
    return () => setError(null);
  }, [report]);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
   
    try {
      const s3Key = generateS3Key(report);
      console.log('Generated S3 Key:', s3Key);

      const s3Client = new S3Client(awsConfig);
      const command = new GetObjectCommand({
        Bucket: 'ellucian-mc-grc-eu-dev',
        Key: s3Key
      });

      const response = await s3Client.send(command);
      const blob = await response.Body.transformToWebStream();
      const url = URL.createObjectURL(await new Response(blob).blob());
     
      const link = document.createElement('a');
      link.href = url;
      link.download = report.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError(`Download failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.downloadContainer}>
      <Button
        className={buttonStyles}
        onClick={handleDownload}
        disabled={loading}
        startIcon={loading ? <Icon name="spinner" className={buttonStyles} /> : <Icon name="download" />}
      >
        {loading ? 'Downloading...' : 'Download'}
      </Button>
      {error && <div className={classes.errorMessage}>{error}</div>}
    </div>
  );
};

DownloadButton.propTypes = {
  classes: PropTypes.object.isRequired,
  report: PropTypes.shape({
    jobStatus: PropTypes.string.isRequired,
    fileName: PropTypes.string.isRequired,
    jobExecutedBy: PropTypes.string.isRequired,
    jobName: PropTypes.string.isRequired,
    jobExecutedAt: PropTypes.string.isRequired,
    tenantId: PropTypes.string.isRequired,
    jobId: PropTypes.string.isRequired
  }).isRequired
};

const AsyncJobReport = ({ classes, userInfo }) => {
  const [filters, setFilters] = useState({
    jobName: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage, setReportsPerPage] = useState(3);

  const rowsPerPageOptions = [3, 5, 10, 25];

  const handleJobNameChange = (e) => {
    setFilters(prev => ({
      ...prev,
      jobName: e.target.value
    }));
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setFilters(prev => ({
      ...prev,
      status: e.target.value
    }));
    setCurrentPage(1);
  };

  const handleDateRangeChange = (type, date) => {
    setFilters(prev => ({
      ...prev,
      [type]: date
    }));
    setCurrentPage(1);
  };


  const addOneDay = (date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  };

  const formatDateForAPI = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${month}-${day}-${year}`; 
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        
        const tenantId = userInfo?.tenantId;
        if (!tenantId) {
          setFetchError('Tenant ID is required');
          return;
        }

        let url = `https://n3jk089s0f.execute-api.eu-west-1.amazonaws.com/asyncReport_lambda?tenantId=${tenantId}`;

        if (filters.jobName) {
          url += `&jobName=${filters.jobName}`;
        }
        if (filters.status) {
          url += `&jobStatus=${filters.status}`;
        }
        
        if ((filters.startDate && !filters.endDate) || (!filters.startDate && filters.endDate)) {
          setFetchError('Please provide both Start Date and End Date');
          return;
        }
        
        if (filters.startDate && filters.endDate) {
          const startDate = new Date(filters.startDate);
          let endDate = new Date(filters.endDate);
          endDate = addOneDay(endDate); 
          if (startDate.getTime() === endDate.getTime()) {
            endDate = addOneDay(startDate);
          }
          
          const formattedStartDate = formatDateForAPI(startDate);
          const formattedEndDate = formatDateForAPI(endDate);
          
          url += `&jobExecutedAt=${formattedStartDate}to${formattedEndDate}`;
        }

        console.log('Fetching from URL:', url);
        const response = await axios.get(url);
        setReports(response.data);
        setFetchError(null);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setFetchError('Failed to load reports. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [filters, userInfo?.tenantId]);

  useEffect(() => {
    
    if (userInfo?.tenantId) {
      console.log("userInfo.tenantId:", userInfo.tenantId);
    }
  }, [userInfo?.tenantId]); 

 
  const jobNames = [
    { label: "All Job Names", value: "" },
    { label: "Bulk Update", value: "bulk_update" },
    { label: "Copy", value: "copy" },
    { label: "ERP", value: "erp" }
  ];

  const statusOptionss = [
    { label: "All Statuses", value: "" },
    { label: "Success", value: "success" },
    { label: "Failed", value: "failed" }
  ];

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);

  return (
    <div className={classes.root}>
      <h1 className={classes.heading}>Async Job Report</h1>
      <div className={classes.filterSection}>
        <div className={classes.filterRow}>
          <Dropdown 
            id="job-name-filter"
            name="job-Name"
            label="Job Name" 
            value={filters.jobName} 
            onChange={handleJobNameChange} 
            className={classes.dropdown}
          >
            {jobNames.map(({ label, value }) => (
              <DropdownItem 
                key={value} 
                id={`job-name-${value || 'all'}`}
                label={label} 
                value={value} 
              />
            ))}
          </Dropdown>

          <Dropdown 
            id="status-filter"
            name="status"
            label="Status" 
            value={filters.status} 
            onChange={handleStatusChange} 
            className={classes.dropdown}
          >
            {statusOptionss.map(({ label, value }) => (
              <DropdownItem 
                key={value} 
                id={`status-${value || 'all'}`}
                label={label} 
                value={value} 
              />
            ))}
          </Dropdown>

          <DatePicker 
            id="start-date-picker"
            name="start-date"
            label="Start Date" 
            placeholder="YYYY-MM-DD"
            value={filters.startDate} 
            onDateChange={(date) => handleDateRangeChange('startDate', date)} 
          />

          <DatePicker 
            id="end-date-picker"
            name="end-date"
            label="End Date" 
            placeholder="YYYY-MM-DD"
            value={filters.endDate} 
            onDateChange={(date) => handleDateRangeChange('endDate', date)} 
          />
        </div>
      </div>
      <div className={classes.tableSection}>
        {isLoading ? (
          <div className={classes.loadingState}>Loading...</div>
        ) : fetchError ? (
          <div className={classes.errorState}>{fetchError}</div>
        ) : (
          <>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th className={`${classes.tableHeader} ${classes.jobNameColumn}`}>Job Name</th>
                  <th className={`${classes.tableHeader} ${classes.executionTimeColumn}`}>Execution Time</th>
                  <th className={`${classes.tableHeader} ${classes.statusColumn}`}>Status</th>
                  <th className={`${classes.tableHeader} ${classes.jobIdColumn}`}>Job ID</th>
                  <th className={`${classes.tableHeader} ${classes.executedByColumn}`}>Executed By</th>
                  <th className={`${classes.tableHeader} ${classes.downloadColumn}`}>Reports</th>
                </tr>
              </thead>
              <tbody>
                {currentReports.map((report, index) => (
                  <tr key={index}>
                    <td className={`${classes.tableCell} ${classes.jobNameColumn}`}>{report.jobName}</td>
                    <td className={`${classes.tableCell} ${classes.executionTimeColumn}`}>
                      {report.jobExecutedAt}
                    </td>
                    <td className={`${classes.tableCell} ${classes.statusColumn}`}>
  <span className={classNames(
    classes.statusBadge,
    {
      [classes.completed]: report.jobStatus === 'success',
      [classes.failed]: report.jobStatus === 'failed'
    }
  )}>
    {report.jobStatus}
  </span>
</td>
                    <td className={`${classes.tableCell} ${classes.jobIdColumn}`}>{report.jobId}</td>
                    <td className={`${classes.tableCell} ${classes.executedByColumn}`}>{report.jobExecutedBy}</td>
                    <td className={`${classes.tableCell} ${classes.downloadColumn}`}>
                      <DownloadButton classes={classes} report={report} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={classes.paginationContainer}>
              <Pagination
                id="reports-pagination"
                count={reports.length}
                rowsPerPage={reportsPerPage}
                page={currentPage - 1}
                rowsPerPageOptions={rowsPerPageOptions}
                onPageChange={(_event, newPage) => setCurrentPage(newPage + 1)}
                onRowsPerPageChange={(event) => {
                  const newRowsPerPage = parseInt(event.target.value, 10);
                  setReportsPerPage(newRowsPerPage);
                  setCurrentPage(1); 
                }}
                labelRowsPerPage="Records per page:"
                SelectProps={{
                  id: 'rows-per-page-select',
                  name: 'rows-per-page'
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

AsyncJobReport.propTypes = {
  classes: PropTypes.object.isRequired,
  userInfo: PropTypes.shape({
    tenantId: PropTypes.string.isRequired
  }).isRequired
};
 
export default withStyles(styles)(AsyncJobReport);