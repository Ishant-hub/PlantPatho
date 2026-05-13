import { Info, Users, Lightbulb, Code, Target } from '@phosphor-icons/react';

const About = () => {
  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
      <div className="glass-panel p-8">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
          <div className="w-16 h-16 bg-brand-green-light text-brand-green rounded-2xl flex items-center justify-center text-3xl">
            <Info weight="fill" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Smart Plant Disease Monitoring System</h2>
            <p className="text-slate-500 font-medium">An AI-powered IoT solution for modern agriculture.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <section>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Target className="text-brand-green" /> Project Overview
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed text-justify">
                This project aims to automate the detection of plant leaf diseases using an ESP32-CAM module and a lightweight MobileNetV2 artificial intelligence model. By capturing images of plant leaves and processing them in real-time on a Flask backend, the system determines whether the plant is healthy or diseased.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Lightbulb className="text-warning" /> Objectives & Workflow
              </h3>
              <ul className="text-sm text-slate-600 list-disc pl-5 flex flex-col gap-2">
                <li>Capture high-quality leaf images via ESP32-CAM.</li>
                <li>Transmit images securely to the local/cloud Flask server.</li>
                <li>Execute MobileNetV2 inference to classify Healthy (1) vs Diseased (0).</li>
                <li>Trigger hardware actions (Relay Module) based on inference results.</li>
                <li>Display real-time analytics on a responsive SaaS dashboard.</li>
              </ul>
            </section>
          </div>

          <div className="flex flex-col gap-6">
            <section>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Code className="text-info" /> Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">React</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">Tailwind CSS</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">Vite</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">Python Flask</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">TensorFlow (MobileNetV2)</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">SQLite</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">ESP32-CAM (C++)</span>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Users className="text-brand-green" /> SDG Goals & Future Scope
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Aligns with <strong>UN SDG 2 (Zero Hunger)</strong> and <strong>SDG 12 (Responsible Consumption)</strong> by preventing crop loss and minimizing unnecessary pesticide use through targeted interventions.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong>Future Scope:</strong> Integration with soil moisture sensors, weather APIs, and extending the dataset to support multiple crop varieties and disease types.
              </p>
            </section>
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-slate-400 pb-4">
        &copy; {new Date().getFullYear()} SmartAgri Development Team. All rights reserved.
      </div>
    </div>
  );
};

export default About;
