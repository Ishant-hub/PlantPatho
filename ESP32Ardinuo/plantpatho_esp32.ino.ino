#define RELAY_PIN 12

void setup() {

  Serial.begin(115200);

  pinMode(RELAY_PIN, OUTPUT);

  // Relay OFF initially
  digitalWrite(RELAY_PIN, HIGH);

}

void loop() {

  // Pump ON
  Serial.println("Pump ON");
  digitalWrite(RELAY_PIN, LOW);
  delay(5000);

  // Pump OFF
  Serial.println("Pump OFF");
  digitalWrite(RELAY_PIN, HIGH);
  delay(5000);
}