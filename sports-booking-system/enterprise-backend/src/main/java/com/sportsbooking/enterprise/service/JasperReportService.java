package com.sportsbooking.enterprise.service;

import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimpleXlsxReportConfiguration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Collection;
import java.util.Map;

@Service
@Slf4j
public class JasperReportService {

    /**
     * Compile and export report to PDF format
     */
    public byte[] exportReportToPdf(String reportPath, Map<String, Object> parameters, Collection<?> dataCollection) throws Exception {
        JasperPrint jasperPrint = generateJasperPrint(reportPath, parameters, dataCollection);
        return JasperExportManager.exportReportToPdf(jasperPrint);
    }

    /**
     * Compile and export report to Excel (XLSX) format
     */
    public byte[] exportReportToExcel(String reportPath, Map<String, Object> parameters, Collection<?> dataCollection) throws Exception {
        JasperPrint jasperPrint = generateJasperPrint(reportPath, parameters, dataCollection);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        JRXlsxExporter exporter = new JRXlsxExporter();
        exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
        exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(outputStream));

        SimpleXlsxReportConfiguration configuration = new SimpleXlsxReportConfiguration();
        configuration.setOnePagePerSheet(false);
        configuration.setRemoveEmptySpaceBetweenRows(true);
        configuration.setDetectCellType(true);
        exporter.setConfiguration(configuration);

        exporter.exportReport();
        return outputStream.toByteArray();
    }

    private JasperPrint generateJasperPrint(String reportPath, Map<String, Object> parameters, Collection<?> dataCollection) throws Exception {
        ClassPathResource resource = new ClassPathResource(reportPath);
        try (InputStream inputStream = resource.getInputStream()) {
            JasperReport jasperReport = JasperCompileManager.compileReport(inputStream);
            JRDataSource dataSource = (dataCollection != null && !dataCollection.isEmpty())
                    ? new JRBeanCollectionDataSource(dataCollection)
                    : new JREmptyDataSource();
            return JasperFillManager.fillReport(jasperReport, parameters, dataSource);
        }
    }
}
